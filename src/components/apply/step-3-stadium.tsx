import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StadiumZoneSelector } from "@/components/stadium/stadium-zone-selector";
import type { Zone } from "@/lib/types";

interface Props {
  zones: Zone[];
  selectedZoneIds: string[];
  onToggleZone: (zoneId: string) => void;
  needsDesk: boolean;
  needsPower: boolean;
  needsLanWifi: boolean;
  carPlateNumber: string;
  onChangeLogistics: (patch: Partial<{ needsDesk: boolean; needsPower: boolean; needsLanWifi: boolean; carPlateNumber: string }>) => void;
}

export function Step3Stadium({
  zones,
  selectedZoneIds,
  onToggleZone,
  needsDesk,
  needsPower,
  needsLanWifi,
  carPlateNumber,
  onChangeLogistics,
}: Props) {
  return (
    <div className="space-y-8">
      <div>
        <p className="mb-1 text-sm font-medium">Stade Abdoulaye Wade — Diamniadio</p>
        <p className="mb-4 text-xs text-muted-foreground">
          Sélectionnez les zones souhaitées. L&apos;attribution définitive reste à la discrétion de
          la Commission Communication FSF selon les quotas disponibles.
        </p>
        <StadiumZoneSelector zones={zones} selected={selectedZoneIds} onToggle={onToggleZone} />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium">Besoins techniques</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm">
            <Checkbox checked={needsDesk} onCheckedChange={(v) => onChangeLogistics({ needsDesk: Boolean(v) })} />
            Pupitre / bureau
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm">
            <Checkbox
              checked={needsPower}
              onCheckedChange={(v) => onChangeLogistics({ needsPower: Boolean(v) })}
            />
            Prise électrique
          </label>
          <label className="flex items-center gap-2 rounded-xl border border-border p-3 text-sm">
            <Checkbox
              checked={needsLanWifi}
              onCheckedChange={(v) => onChangeLogistics({ needsLanWifi: Boolean(v) })}
            />
            Accès LAN / Wi-Fi
          </label>
        </div>
        <div className="mt-4 space-y-1.5">
          <Label htmlFor="carPlate">Plaque du véhicule de régie (optionnel)</Label>
          <Input
            id="carPlate"
            placeholder="DK-1234-AB"
            value={carPlateNumber}
            onChange={(e) => onChangeLogistics({ carPlateNumber: e.target.value })}
            className="max-w-xs font-mono"
          />
        </div>
      </div>
    </div>
  );
}
