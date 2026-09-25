import { Radio } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Brand() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="APPLIFYR home">
      <span className="grid size-9 place-items-center rounded-md border border-brand/50 bg-brand/10 text-signal shadow-glow transition-transform group-hover:-translate-y-0.5">
        <Radio className="size-5" />
      </span>
      <span className="font-display text-lg font-bold tracking-normal text-foreground">APPLIFYR</span>
    </Link>
  );
}
