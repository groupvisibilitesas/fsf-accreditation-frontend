import { Check } from "lucide-react";
import { cn } from "cn";

const STEPS = ["Profil & catégorie", "Organe de presse", "Zones du stade", "Justificatifs"];

export function StepIndicator({ current }: { current: number }) {
  return (
    <ol className="flex items-center justify-between gap-2">
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const done = stepNumber < current;
        const active = stepNumber === current;
        return (
          <li key={label} className="flex flex-1 flex-col items-center gap-2 text-center">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary text-primary",
                !done && !active && "border-border text-muted-foreground",
              )}
            >
              {done ? <Check className="size-4" /> : stepNumber}
            </div>
            <span
              className={cn(
                "hidden text-xs sm:block",
                active ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
