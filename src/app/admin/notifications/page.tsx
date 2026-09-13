"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bell, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";

interface Template {
  event: string;
  subject: string;
  bodyTemplate: string;
  customized: boolean;
  active: boolean;
}

const EVENT_LABELS: Record<string, string> = {
  ACCOUNT_CREATED: "Compte créé",
  REQUEST_RECEIVED: "Demande reçue",
  COMPLEMENT_REQUESTED: "Complément demandé",
  REQUEST_VALIDATED: "Demande validée",
  REQUEST_REJECTED: "Demande refusée",
  BADGE_AVAILABLE: "Badge disponible",
  MATCH_UPDATED: "Match mis à jour",
  CLOSURE_REMINDER: "Rappel de clôture",
  ACCREDITATION_REVOKED: "Accréditation révoquée",
};

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Template | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["notification-templates"],
    queryFn: () => api.get<Template[]>("/admin/notification-templates"),
  });

  const mutation = useMutation({
    mutationFn: () =>
      api.put(`/admin/notification-templates/${editing!.event}`, {
        subject,
        bodyTemplate: body,
        active: true,
      }),
    onSuccess: () => {
      toast.success("Gabarit mis à jour.");
      queryClient.invalidateQueries({ queryKey: ["notification-templates"] });
      setEditing(null);
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "Erreur"),
  });

  function openEdit(template: Template) {
    setEditing(template);
    setSubject(template.subject);
    setBody(template.bodyTemplate);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Centre de notifications</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Gabarits d&apos;email envoyés automatiquement aux demandeurs.
      </p>

      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Chargement...</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {data?.map((template) => (
            <div key={template.event} className="glass-panel flex items-center justify-between rounded-xl p-4">
              <div>
                <p className="flex items-center gap-2 font-medium">
                  <Bell className="size-4 text-primary" /> {EVENT_LABELS[template.event] ?? template.event}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{template.subject}</p>
                {template.customized && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    Personnalisé
                  </Badge>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={() => openEdit(template)}>
                <Pencil /> Modifier
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing && (EVENT_LABELS[editing.event] ?? editing.event)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="subject">Objet</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="body">Corps (variables entre {"{{ }}"})</Label>
              <Textarea id="body" rows={8} value={body} onChange={(e) => setBody(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
              {mutation.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
