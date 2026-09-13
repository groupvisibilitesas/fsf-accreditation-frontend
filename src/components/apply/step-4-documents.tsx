"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { DOCUMENT_TYPE_LABELS } from "@/lib/labels";
import type { DocumentType } from "@/lib/types";
import { cn } from "cn";

interface Props {
  requestId: string;
  requiredTypes: DocumentType[];
  uploaded: Set<DocumentType>;
  onUploaded: (type: DocumentType) => void;
}

export function Step4Documents({ requestId, requiredTypes, uploaded, onUploaded }: Props) {
  const [uploading, setUploading] = useState<DocumentType | null>(null);
  const [errors, setErrors] = useState<Partial<Record<DocumentType, string>>>({});

  const types = Array.from(new Set<DocumentType>(["PIECE_IDENTITE", "PHOTO", ...requiredTypes]));

  async function handleFile(documentType: DocumentType, file: File) {
    setUploading(documentType);
    setErrors((prev) => ({ ...prev, [documentType]: undefined }));
    try {
      const formData = new FormData();
      formData.append("documentType", documentType);
      formData.append("file", file);
      await api.upload(`/requests/${requestId}/documents`, formData);
      onUploaded(documentType);
    } catch {
      setErrors((prev) => ({ ...prev, [documentType]: "Échec du téléversement, réessayez." }));
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="space-y-3">
      {types.map((type) => {
        const isRequired = requiredTypes.includes(type);
        const isUploaded = uploaded.has(type);
        const isUploading = uploading === type;
        return (
          <div
            key={type}
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl border p-4",
              isUploaded ? "border-primary/40 bg-primary/5" : "border-border",
            )}
          >
            <div>
              <p className="text-sm font-medium">
                {DOCUMENT_TYPE_LABELS[type]}
                {isRequired && <span className="ml-1 text-destructive">*</span>}
              </p>
              {errors[type] && <p className="text-xs text-destructive">{errors[type]}</p>}
            </div>

            {isUploaded ? (
              <span className="inline-flex items-center gap-1.5 text-sm text-primary">
                <CheckCircle2 className="size-4" /> Déposé
              </span>
            ) : (
              <Button asChild variant="outline" size="sm" disabled={isUploading}>
                <label className="cursor-pointer">
                  {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
                  {isUploading ? "Envoi..." : "Choisir un fichier"}
                  <input
                    type="file"
                    className="sr-only"
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleFile(type, file);
                    }}
                  />
                </label>
              </Button>
            )}
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground">* Justificatif obligatoire pour cette catégorie.</p>
    </div>
  );
}
