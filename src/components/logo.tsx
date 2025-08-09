import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-8 w-8", className)}
    >
      {/* Book cover */}
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        className="text-primary"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--primary))"
      />
      <path
        d="M6.5 2H20v15H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
        className="text-primary"
        fill="hsl(var(--primary))"
        stroke="hsl(var(--primary))"
      />
      {/* Letters */}
      <path
        d="M14 13h-2"
        className="stroke-primary-foreground"
        strokeWidth="2"
      />
      <path
        d="m10 13-2-2"
        className="stroke-primary-foreground"
        strokeWidth="2"
      />
      <path
        d="M12 11 10 9"
        className="stroke-primary-foreground"
        strokeWidth="2"
      />
      <path
        d="M16 9h-2"
        className="stroke-primary-foreground"
        strokeWidth="2"
      />
      <path
        d="m14 9-2-2"
        className="stroke-primary-foreground"
        strokeWidth="2"
      />
    </svg>
  );
}
