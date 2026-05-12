import { cn } from "@/lib/utils";

type BadgeTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info";

const tones: Record<BadgeTone, string> = {
  neutral:
    "bg-muted text-muted-foreground ring-border",
  primary:
    "bg-primary/10 text-primary ring-primary/20 dark:bg-primary/15",
  success:
    "bg-success/10 text-success ring-success/20 dark:bg-success/15",
  warning:
    "bg-warning/10 text-warning ring-warning/20 dark:bg-warning/15",
  danger:
    "bg-danger/10 text-danger ring-danger/20 dark:bg-danger/15",
  info: "bg-info/10 text-info ring-info/20 dark:bg-info/15",
};

interface BadgeProps {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
}

export function Badge({ tone = "neutral", className, children, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset capitalize whitespace-nowrap",
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", {
            "bg-muted-foreground": tone === "neutral",
            "bg-primary": tone === "primary",
            "bg-success": tone === "success",
            "bg-warning": tone === "warning",
            "bg-danger": tone === "danger",
            "bg-info": tone === "info",
          })}
        />
      )}
      {children}
    </span>
  );
}
