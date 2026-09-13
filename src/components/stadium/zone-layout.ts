import type { LucideIcon } from "lucide-react";
import {
  Newspaper,
  Camera,
  Tv,
  Mic,
  Presentation,
  Radio as RadioIcon,
  Mic2,
  Video,
  Car,
  Wrench,
} from "lucide-react";

export interface PitchZoneLayout {
  code: string;
  area: "pitch";
  /** Position en pourcentage dans le repere isometrique du stade. */
  top: number;
  left: number;
  width: number;
  height: number;
  icon: LucideIcon;
  color: string;
}

export interface FacilityZoneLayout {
  code: string;
  area: "facility";
  icon: LucideIcon;
  color: string;
}

export type ZoneLayout = PitchZoneLayout | FacilityZoneLayout;

export function isPitchZone(zone: ZoneLayout): zone is PitchZoneLayout {
  return zone.area === "pitch";
}

export function isFacilityZone(zone: ZoneLayout): zone is FacilityZoneLayout {
  return zone.area === "facility";
}

/**
 * Association code de zone (backend, cf. seed) -> position/estilo dans la
 * carte 3D. Les zones "terrain" apparaissent sur la maquette isometrique du
 * stade ; les zones "installations" (salles, studios, parking) apparaissent
 * dans une grille dediee sous la carte.
 */
export const ZONE_LAYOUT: Record<string, ZoneLayout> = {
  TRIBUNE_PRESSE: {
    code: "TRIBUNE_PRESSE",
    area: "pitch",
    top: 4,
    left: 20,
    width: 60,
    height: 14,
    icon: Newspaper,
    color: "#10b981",
  },
  TRIBUNE_MEDIA: {
    code: "TRIBUNE_MEDIA",
    area: "pitch",
    top: 82,
    left: 20,
    width: 60,
    height: 14,
    icon: RadioIcon,
    color: "#f59e0b",
  },
  ZONE_PHOTOGRAPHES: {
    code: "ZONE_PHOTOGRAPHES",
    area: "pitch",
    top: 40,
    left: 2,
    width: 14,
    height: 24,
    icon: Camera,
    color: "#dc2626",
  },
  ZONE_TV: {
    code: "ZONE_TV",
    area: "pitch",
    top: 40,
    left: 84,
    width: 14,
    height: 24,
    icon: Tv,
    color: "#34d399",
  },
  ZONE_MIXTE: {
    code: "ZONE_MIXTE",
    area: "pitch",
    top: 40,
    left: 40,
    width: 20,
    height: 20,
    icon: Mic,
    color: "#fbbf24",
  },
  SALLE_CONFERENCE: { code: "SALLE_CONFERENCE", area: "facility", icon: Presentation, color: "#10b981" },
  STUDIO_TV: { code: "STUDIO_TV", area: "facility", icon: Video, color: "#34d399" },
  CABINE_COMMENTATEUR: { code: "CABINE_COMMENTATEUR", area: "facility", icon: Mic2, color: "#f59e0b" },
  FLASH_INTERVIEW: { code: "FLASH_INTERVIEW", area: "facility", icon: Mic, color: "#fbbf24" },
  PARKING_MEDIA: { code: "PARKING_MEDIA", area: "facility", icon: Car, color: "#94a3b8" },
  ZONE_TECHNIQUE: { code: "ZONE_TECHNIQUE", area: "facility", icon: Wrench, color: "#94a3b8" },
};
