"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MessageSquareWarning } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";

export function ComplementDialog({ requestId }: { requestId: string }) {
  const [open, setOpen] = useState(false);
  const [missingItem, setMissingItem] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.post(`/admin/requests/${requestId}/complement`, { missingItem }),
    onSuccess: () => {
      toast.success("Complément demandé au demandeur.");
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      setMissingItem("");
      setOpen(false);
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "Erreur"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <MessageSquareWarning /> Complément
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Demander un complément</DialogTitle>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="missingItem">Document ou information manquante</Label>
          <Input id="missingItem" value={missingItem} onChange={(e) => setMissingItem(e.target.value)} />
        </div>
        <DialogFooter>
          <Button onClick={() => mutation.mutate()} disabled={!missingItem || mutation.isPending}>
            {mutation.isPending ? "Envoi..." : "Envoyer la demande"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
