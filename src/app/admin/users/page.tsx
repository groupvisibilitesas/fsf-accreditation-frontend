"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CreateUserDialog } from "@/components/admin/create-user-dialog";
import { UserRowActions } from "@/components/admin/user-row-actions";
import { api } from "@/lib/api-client";
import { STAFF_ROLE_LABELS, USER_STATUS_LABELS } from "@/lib/labels";
import type {
  InternalUser,
  LoginAttempt,
  PaginatedResult,
  StaffRole,
  UserStatus,
} from "@/lib/types";

const STATUS_TONE: Record<UserStatus, string> = {
  PENDING: "bg-secondary/20 text-secondary-foreground",
  ACTIVE: "bg-primary/15 text-primary",
  INACTIVE: "bg-muted text-muted-foreground",
  SUSPENDED: "bg-destructive/15 text-destructive",
};

function AccountsTab() {
  const [role, setRole] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", role, status],
    queryFn: () =>
      api.get<PaginatedResult<InternalUser>>("/admin/users", {
        pageSize: 100,
        kind: "STAFF",
        ...(role !== "ALL" ? { role } : {}),
        ...(status !== "ALL" ? { status } : {}),
      }),
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Tous les rôles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les rôles</SelectItem>
              {Object.entries(STAFF_ROLE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les statuts</SelectItem>
              {Object.entries(USER_STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <CreateUserDialog />
      </div>

      <div className="glass-panel overflow-x-auto rounded-2xl p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Compte</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((user) => {
                const locked = user.lockedUntil && new Date(user.lockedUntil) > new Date();
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <p className="font-medium">{user.displayName || "—"}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.role ? STAFF_ROLE_LABELS[user.role as StaffRole] : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Badge className={`border-0 ${STATUS_TONE[user.status]}`}>
                          {USER_STATUS_LABELS[user.status]}
                        </Badge>
                        {locked && (
                          <Badge variant="destructive" title={`Verrouillé jusqu'au ${new Date(user.lockedUntil!).toLocaleString("fr-FR")}`}>
                            <Lock className="size-3" /> Verrouillé
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {user.lastLoginAt
                        ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(
                            new Date(user.lastLoginAt),
                          )
                        : "Jamais"}
                    </TableCell>
                    <TableCell className="text-right">
                      <UserRowActions user={user} />
                    </TableCell>
                  </TableRow>
                );
              })}
              {data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    Aucun compte interne trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function LoginAttemptsTab() {
  const [email, setEmail] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-login-attempts", email],
    queryFn: () =>
      api.get<PaginatedResult<LoginAttempt>>("/admin/users/login-attempts", {
        pageSize: 100,
        ...(email ? { email } : {}),
      }),
  });

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Input
          placeholder="Filtrer par e-mail exact..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-72"
        />
      </div>
      <div className="glass-panel overflow-x-auto rounded-2xl p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Résultat</TableHead>
                <TableHead>Adresse IP</TableHead>
                <TableHead>Appareil</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "medium" }).format(
                      new Date(attempt.createdAt),
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{attempt.email}</TableCell>
                  <TableCell>
                    {attempt.succeeded ? (
                      <Badge className="border-0 bg-primary/15 text-primary">Succès</Badge>
                    ) : (
                      <Badge variant="destructive">{attempt.reason ?? "Échec"}</Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{attempt.ipAddress ?? "—"}</TableCell>
                  <TableCell className="max-w-64 truncate text-xs text-muted-foreground" title={attempt.userAgent ?? undefined}>
                    {attempt.userAgent ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
              {data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    Aucune tentative enregistrée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Utilisateurs internes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Comptes, rôles, statuts et traçabilité des connexions (cahier §23, §24).
        </p>
      </div>

      <Tabs defaultValue="accounts">
        <TabsList>
          <TabsTrigger value="accounts">Comptes</TabsTrigger>
          <TabsTrigger value="logins">Connexions</TabsTrigger>
        </TabsList>
        <TabsContent value="accounts">
          <AccountsTab />
        </TabsContent>
        <TabsContent value="logins">
          <LoginAttemptsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
