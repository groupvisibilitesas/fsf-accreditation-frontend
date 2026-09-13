import { Check } from "lucide-react";
import { cn } from "cn";
import type { AccreditationCategory, RequesterProfile, RoleInEvent } from "@/lib/types";
import { ROLE_IN_EVENT_LABELS } from "@/lib/labels";

const ROLES = Object.keys(ROLE_IN_EVENT_LABELS) as RoleInEvent[];

interface Props {
  profile: RequesterProfile;
  categories: AccreditationCategory[];
  categoryId: string | null;
  roleInEvent: RoleInEvent | null;
  onSelectCategory: (id: string) => void;
  onSelectRole: (role: RoleInEvent) => void;
}

export function Step1Category({
  profile,
  categories,
  categoryId,
  roleInEvent,
  onSelectCategory,
  onSelectRole,
}: Props) {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-card/60 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Profil demandeur (compte)
        </p>
        <p className="mt-1 font-display text-lg font-semibold">
          {profile.firstName} {profile.lastName}
        </p>
        <p className="text-sm text-muted-foreground">
          {profile.function} · {profile.pressCardNumber ? `CNP ${profile.pressCardNumber}` : "Sans CNP renseignée"}
        </p>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium">Type d&apos;accréditation demandée</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((category) => {
            const active = category.id === categoryId;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onSelectCategory(category.id)}
                className={cn(
                  "flex items-center justify-between rounded-xl border p-4 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card hover:border-primary/40",
                )}
              >
                <div>
                  <p className="font-medium">{category.label}</p>
                  <p className="text-xs text-muted-foreground">Code {category.code}</p>
                </div>
                {active && <Check className="size-5 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium">Votre rôle sur l&apos;événement</p>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => onSelectRole(role)}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-colors",
                roleInEvent === role
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              {ROLE_IN_EVENT_LABELS[role]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
