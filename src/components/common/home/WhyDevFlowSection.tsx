import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { productPrinciples } from "@/features/auth/utils/home.data";

export default function WhyDevFlowSection() {
  return (
    <section className="py-20 sm:py-28 relative">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/70 p-7 sm:p-10 lg:p-14 shadow-xl backdrop-blur-md">
          {/* Subtle background ambient gradient */}
          <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-primary/10 blur-[80px]" />

          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <Badge variant="secondary" className="px-3 py-1 font-semibold text-primary bg-primary/10 border-primary/20">
                Architectural Integrity
              </Badge>

              <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Rigorous Controls.
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Zero Technical Bloat.
                </span>
              </h2>

              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Engineered with Spring Boot security, PostgreSQL relational persistence, and clean React Query state management. DevFlow enforces deterministic boundaries without unnecessary abstraction.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-[11px] font-mono text-muted-foreground">
                <span className="rounded-md border border-border/80 bg-muted/30 px-2 py-1">Spring Boot 3</span>
                <span className="rounded-md border border-border/80 bg-muted/30 px-2 py-1">React 19</span>
                <span className="rounded-md border border-border/80 bg-muted/30 px-2 py-1">PostgreSQL</span>
                <span className="rounded-md border border-border/80 bg-muted/30 px-2 py-1">TanStack Query</span>
              </div>
            </div>

            <div className="space-y-3">
              {productPrinciples.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3.5 rounded-xl border border-border/70 bg-background/80 px-4 py-3 shadow-2xs transition-all hover:border-primary/40 hover:bg-muted/30"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Check className="size-4 stroke-[2.5]" />
                  </div>

                  <span className="text-xs sm:text-sm font-semibold text-foreground/90">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}