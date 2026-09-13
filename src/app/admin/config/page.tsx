"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ZoneDialog } from "@/components/admin/zone-dialog";
import { CategoryDialog } from "@/components/admin/category-dialog";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { DOCUMENT_TYPE_LABELS } from "@/lib/labels";
import type { AccreditationCategory, Zone } from "@/lib/types";

export default function AdminConfigPage() {
  const queryClient = useQueryClient();

  const { data: zones, isLoading: loadingZones } = useQuery({
    queryKey: ["admin-zones"],
    queryFn: () => api.get<Zone[]>("/zones"),
  });

  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.get<AccreditationCategory[]>("/accreditation-categories"),
  });

  const toggleZone = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.patch(`/admin/zones/${id}`, { active }),
    onSuccess: () => {
      toast.success("Zone mise à jour.");
      queryClient.invalidateQueries({ queryKey: ["admin-zones"] });
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "Erreur"),
  });

  const toggleCategory = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      api.patch(`/admin/accreditation-categories/${id}`, { active }),
    onSuccess: () => {
      toast.success("Catégorie mise à jour.");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "Erreur"),
  });

  return (
    <div className="space-y-8">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold">Zones d&apos;accès</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Catalogue des zones du stade utilisées dans les quotas par match.
            </p>
          </div>
          <ZoneDialog />
        </div>
        <div className="glass-panel overflow-x-auto rounded-2xl p-4">
          {loadingZones ? (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Libellé</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {zones?.map((zone) => (
                  <TableRow key={zone.id}>
                    <TableCell className="font-mono text-xs">{zone.code}</TableCell>
                    <TableCell className="font-medium">{zone.label}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {zone.description}
                    </TableCell>
                    <TableCell>
                      <Badge className={zone.active ? "bg-primary/15 text-primary border-0" : "border-0"}>
                        {zone.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="text-xs font-medium text-primary hover:underline"
                          onClick={() => toggleZone.mutate({ id: zone.id, active: !zone.active })}
                        >
                          {zone.active ? "Désactiver" : "Activer"}
                        </button>
                        <ZoneDialog zone={zone} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold">Catégories d&apos;accréditation</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Types de médias et justificatifs requis pour chaque catégorie.
            </p>
          </div>
          <CategoryDialog />
        </div>
        <div className="glass-panel overflow-x-auto rounded-2xl p-4">
          {loadingCategories ? (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Libellé</TableHead>
                  <TableHead>Justificatifs requis</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories?.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-mono text-xs">{category.code}</TableCell>
                    <TableCell className="font-medium">{category.label}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {category.requiredDocumentTypes.map((d) => DOCUMENT_TYPE_LABELS[d]).join(", ") || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={category.active ? "bg-primary/15 text-primary border-0" : "border-0"}>
                        {category.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="text-xs font-medium text-primary hover:underline"
                          onClick={() =>
                            toggleCategory.mutate({ id: category.id, active: !category.active })
                          }
                        >
                          {category.active ? "Désactiver" : "Activer"}
                        </button>
                        <CategoryDialog category={category} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
