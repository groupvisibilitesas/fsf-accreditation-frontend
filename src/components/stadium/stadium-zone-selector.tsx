"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "cn";
import { isFacilityZone, isPitchZone, ZONE_LAYOUT } from "./zone-layout";
import type { Zone } from "@/lib/types";

interface StadiumZoneSelectorProps {
  zones: Zone[];
  selected: string[];
  onToggle: (zoneId: string) => void;
}

export function StadiumZoneSelector({ zones, selected, onToggle }: StadiumZoneSelectorProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const zoneById = new Map(zones.map((z) => [z.code, z]));
  const pitchZones = Object.values(ZONE_LAYOUT).filter(isPitchZone).filter((z) => zoneById.has(z.code));
  const facilityZones = Object.values(ZONE_LAYOUT).filter(isFacilityZone).filter((z) => zoneById.has(z.code));
  const hoveredZone = hovered ? zoneById.get(hovered) : null;

  return (
    <div className="space-y-6">
      <div className="perspective-2000">
        <motion.div
          initial={{ opacity: 0, rotateX: 70 }}
          animate={{ opacity: 1, rotateX: 58 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="transform-style-3d relative mx-auto aspect-[16/10] max-w-2xl rounded-2xl"
          style={{ transformOrigin: "center bottom" }}
        >
          {/* Pelouse */}
          <div
            className="absolute inset-x-[16%] inset-y-[16%] overflow-hidden rounded-lg border-2 border-white/20 shadow-2xl"
            style={{
              background:
                "repeating-linear-gradient(90deg, #15803d 0%, #15803d 10%, #16a34a 10%, #16a34a 20%)",
            }}
          >
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/30" />
            <div className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/30" />
          </div>

          {pitchZones.map((zone) => {
            const backendZone = zoneById.get(zone.code);
            if (!backendZone) return null;
            const isSelected = selected.includes(backendZone.id);
            const Icon = zone.icon;
            return (
              <button
                key={zone.code}
                type="button"
                onClick={() => onToggle(backendZone.id)}
                onMouseEnter={() => setHovered(zone.code)}
                onMouseLeave={() => setHovered(null)}
                className={cn(
                  "absolute flex flex-col items-center justify-center gap-1 rounded-lg border-2 text-[0.65rem] font-medium text-white shadow-lg transition-all duration-200 hover:z-20 hover:scale-105",
                  isSelected ? "z-10 ring-2 ring-white" : "opacity-90",
                )}
                style={{
                  top: `${zone.top}%`,
                  left: `${zone.left}%`,
                  width: `${zone.width}%`,
                  height: `${zone.height}%`,
                  backgroundColor: isSelected ? zone.color : `${zone.color}99`,
                  borderColor: zone.color,
                }}
              >
                <Icon className="size-4" />
                <span className="hidden text-center leading-tight sm:block">{backendZone.label}</span>
                {isSelected && <Check className="absolute right-1 top-1 size-3" />}
              </button>
            );
          })}
        </motion.div>
      </div>

      {hoveredZone && (
        <p className="text-center text-xs text-muted-foreground">{hoveredZone.description}</p>
      )}

      {facilityZones.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Installations complémentaires
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {facilityZones.map((zone) => {
              const backendZone = zoneById.get(zone.code);
              if (!backendZone) return null;
              const isSelected = selected.includes(backendZone.id);
              const Icon = zone.icon;
              return (
                <button
                  key={zone.code}
                  type="button"
                  onClick={() => onToggle(backendZone.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition-colors",
                    isSelected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40",
                  )}
                >
                  <Icon className="size-4 shrink-0" style={{ color: zone.color }} />
                  <span className="flex-1 truncate">{backendZone.label}</span>
                  {isSelected && <Check className="size-4 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
