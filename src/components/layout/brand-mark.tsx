import { cn } from "cn";

// TODO: remplacer par le vrai blason FSF quand l'asset sera fourni (public/…).
export function BrandMark({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm",
        size === "sm" && "size-8 text-base",
        size === "md" && "size-9 text-lg",
        size === "lg" && "size-12 text-2xl",
        className,
      )}
      aria-hidden
    >
      🦁
    </span>
  );
}
