import type { DocumentType, MediaType, RoleInEvent, StaffRole, UserStatus } from "@/lib/types";

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  CARTE_PRESSE: "Carte Nationale de Presse (CNP)",
  PIECE_IDENTITE: "Pièce d'identité (CNI / Passeport)",
  PHOTO: "Photo d'identité",
  LETTRE_MISSION: "Lettre de mission de l'organe de presse",
  ATTESTATION_MEDIA: "Attestation du média",
  AUTRE: "Autre document",
};

export const ROLE_IN_EVENT_LABELS: Record<RoleInEvent, string> = {
  JOURNALISTE_REPORTER: "Journaliste / Reporter",
  PHOTOGRAPHE: "Photographe",
  CAMERAMAN: "Cadreur / Cameraman",
  COMMENTATEUR: "Commentateur",
  TECHNICIEN_REGIE: "Technicien régie",
};

export const MEDIA_TYPE_LABELS: Record<MediaType, string> = {
  TELEVISION: "Télévision",
  RADIO: "Radio",
  PRESSE_ECRITE: "Presse écrite",
  PRESSE_EN_LIGNE: "Presse en ligne",
  AGENCE: "Agence de presse",
  PHOTOGRAPHE: "Photographe",
  CREATEUR_CONTENU: "Créateur de contenu",
  MEDIA_INTERNATIONAL: "Média international",
  AUTRE: "Autre",
};

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  ADMIN: "Administrateur",
  RESPONSABLE_ACCREDITATION: "Responsable accréditation",
  COMMISSION_VALIDATION: "Commission de validation",
  AGENT_CONTROLE: "Agent de contrôle",
  SUPERVISEUR: "Superviseur / Reporting",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  PENDING: "En attente",
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  SUSPENDED: "Suspendu",
};
