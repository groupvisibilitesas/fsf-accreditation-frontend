// Types miroir du backend NestJS (fsf-acreditation-backend). Ne couvre que
// les champs consommés par le frontend — pas une génération automatique.

export type UserKind = "STAFF" | "REQUESTER";

export type StaffRole =
  | "ADMIN"
  | "RESPONSABLE_ACCREDITATION"
  | "COMMISSION_VALIDATION"
  | "AGENT_CONTROLE"
  | "SUPERVISEUR";

export type UserStatus = "PENDING" | "ACTIVE" | "INACTIVE" | "SUSPENDED";

export type MediaType =
  | "TELEVISION"
  | "RADIO"
  | "PRESSE_ECRITE"
  | "PRESSE_EN_LIGNE"
  | "AGENCE"
  | "PHOTOGRAPHE"
  | "CREATEUR_CONTENU"
  | "MEDIA_INTERNATIONAL"
  | "AUTRE";

export type MediaStatus = "PENDING" | "VALIDATED" | "REJECTED" | "SUSPENDED";

export type BroadcasterTier =
  | "HOST_BROADCASTER"
  | "CAF_RIGHTS_HOLDER"
  | "FIFA_RIGHTS_HOLDER"
  | "NON_RIGHTS_HOLDER"
  | "WRITTEN_PRESS_ACCREDITED";

export type RequesterStatus = "PENDING" | "VALIDATED" | "REJECTED" | "SUSPENDED";

export type CompetitionStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type MatchStatus = "DRAFT" | "OPEN" | "CLOSED" | "PLAYED" | "CANCELLED" | "ARCHIVED";

export type OverflowPolicy = "QUEUE" | "MANUAL_ARBITRATION" | "PRIORITY" | "CLOSE";

export type DocumentSubjectType = "MEDIA" | "REQUESTER" | "REQUEST";

export type DocumentType =
  | "CARTE_PRESSE"
  | "PIECE_IDENTITE"
  | "PHOTO"
  | "LETTRE_MISSION"
  | "ATTESTATION_MEDIA"
  | "AUTRE";

export type DocumentStatus = "PENDING" | "VALIDATED" | "REJECTED" | "SUPERSEDED";

export type RequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "INFO_REQUESTED"
  | "COMPLETE"
  | "PENDING_VALIDATION"
  | "VALIDATED"
  | "REJECTED"
  | "CANCELLED"
  | "BADGE_GENERATED"
  | "ACCESS_USED";

export type RoleInEvent =
  | "JOURNALISTE_REPORTER"
  | "PHOTOGRAPHE"
  | "CAMERAMAN"
  | "COMMENTATEUR"
  | "TECHNICIEN_REGIE";

export type AccreditationStatus = "ACTIVE" | "REVOKED" | "EXPIRED";

export type ScanResult = "VALID" | "INVALID" | "EXPIRED" | "REVOKED" | "ALREADY_USED" | "OUT_OF_SCOPE";

export type ScanSource = "ONLINE" | "OFFLINE_SYNCED";

export type ScanAction = "CHECK_IN" | "CHECK_OUT";

export interface InternalUser {
  id: string;
  email: string;
  kind: UserKind;
  role: StaffRole | null;
  status: UserStatus;
  mfaEnabled: boolean;
  displayName: string | null;
  lastLoginAt: string | null;
  failedLoginAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginAttempt {
  id: string;
  email: string;
  userId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  succeeded: boolean;
  reason: string | null;
  createdAt: string;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  kind: UserKind;
  role: StaffRole | null;
  requesterProfileId?: string;
  permissions: string[];
  displayName?: string | null;
}

export interface AuthTokensResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: AuthenticatedUser;
}

export interface Competition {
  id: string;
  name: string;
  season: string;
  organizer: string | null;
  startDate: string | null;
  endDate: string | null;
  status: CompetitionStatus;
  description: string | null;
}

export interface Match {
  id: string;
  competitionId: string;
  competition?: Competition;
  homeTeam: string;
  awayTeam: string;
  kickoffAt: string;
  timezone?: string;
  stadium: string;
  city: string;
  status: MatchStatus;
  capacityTotal: number | null;
  pressTribuneCapacity: number | null;
  requestsOpenAt: string | null;
  requestsCloseAt: string | null;
  rulesNotes?: string | null;
}

export interface MatchQuotaConfig {
  categoryId: string;
  category: string;
  quotaTotal: number;
  consumed: number;
  overflowPolicy: OverflowPolicy;
  zoneIds: string[];
}

export interface AccreditationCategory {
  id: string;
  code: string;
  label: string;
  requiredDocumentTypes: DocumentType[];
  active?: boolean;
}

export interface Zone {
  id: string;
  code: string;
  label: string;
  description: string | null;
  active?: boolean;
}

export interface MatchQuota {
  categoryId: string;
  category: string;
  quotaTotal: number;
  consumed: number;
  remaining: number;
  overflowPolicy: OverflowPolicy;
  zones: string[];
}

export interface MediaSummary {
  id: string;
  name: string;
  type: MediaType;
  country: string;
}

export interface Media extends MediaSummary {
  status: MediaStatus;
  broadcasterTier: BroadcasterTier | null;
  address: string | null;
  phone: string | null;
  email: string | null;
}

export interface RequesterProfile {
  id: string;
  userId: string;
  mediaId: string;
  media?: Media;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  nationality: string | null;
  phone: string;
  address: string | null;
  function: string;
  specialty: string | null;
  pressCardNumber: string | null;
  professionalPhone: string | null;
  professionalEmail: string | null;
  status: RequesterStatus;
  isEditorInChief: boolean;
  photoDocumentId: string | null;
}

export interface AccreditationRequest {
  id: string;
  uniqueReference: string;
  requesterId: string;
  requester?: RequesterProfile;
  matchId: string;
  match?: Match;
  categoryRequestedId: string;
  categoryRequested?: AccreditationCategory;
  status: RequestStatus;
  roleInEvent: RoleInEvent | null;
  needsDesk: boolean;
  needsPower: boolean;
  needsLanWifi: boolean;
  carPlateNumber: string | null;
  preferredZoneIds: string[];
  submittedAt: string | null;
  decisionAt: string | null;
  decisionById: string | null;
  decisionReason: string | null;
  duplicateOfId: string | null;
  createdAt: string;
  updatedAt: string;
  complements?: RequestComplement[];
  accreditation?: Accreditation | null;
}

export interface RequestComplement {
  id: string;
  requestId: string;
  requestedById: string;
  missingItem: string;
  resolvedAt: string | null;
  createdAt: string;
}

export interface CryptoSignatureData {
  payloadVersion: string;
  rawPayload: string;
  ecdsaSignatureHex: string;
  publicKeyFingerprint: string;
  issuedTimestamp: number;
  expiresTimestamp: number;
  offlineChecksum: string;
}

export interface Accreditation {
  id: string;
  requestId: string;
  number: string;
  status: AccreditationStatus;
  issuedAt: string;
  expiresAt: string;
  revokedAt: string | null;
  revocationReason: string | null;
  assignedBoothNumber: number | null;
  assignedFlashSlot: string | null;
  cryptoSignature: CryptoSignatureData | null;
}

export interface DocumentEntity {
  id: string;
  subjectType: DocumentSubjectType;
  subjectId: string;
  documentType: DocumentType;
  version: number;
  status: DocumentStatus;
  mimeType: string;
  createdAt: string;
  rejectionReason?: string | null;
}

export interface ScanLog {
  id: string;
  accreditationId: string | null;
  result: ScanResult;
  source: ScanSource;
  gate: string | null;
  action: ScanAction;
  scannedById: string;
  matchId: string;
  zoneId: string | null;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface DashboardGlobalStats {
  totalRequests: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  pressTribuneFillRate: number;
  [key: string]: unknown;
}

export interface EditorDeskRoster {
  media: Media;
  journalists: RequesterProfile[];
  requestsByStatus: Record<string, number>;
}

export interface PublicKeyInfo {
  publicKeyPem: string;
  fingerprint: string;
  algorithm: string;
}
