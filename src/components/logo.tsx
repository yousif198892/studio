import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn("h-8 w-8 text-primary", className)}
      fill="currentColor"
    >
      <path d="M2.5 10.5h19v3h-19v-3Zm19.5-3h-20v3h20v-3Zm-21-3h22v3h-22v-3Zm22.5 9h-24v3h24v-3Zm-24 3h24v3h-24v-3Z" />
    </svg>
  );
}
