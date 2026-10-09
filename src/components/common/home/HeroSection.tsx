import { Check, ChevronRight, CircleDot } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-128 bg-[radial-gradient(circle_at_top,var(--color-primary),transparent_65%)] opacity-[0.08]" />

      <div className="mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 sm:pb-24 sm:pt-28 lg:px-8 lg:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium shadow-sm">
            <span className="flex size-5 items-center justify-center rounded-full bg-primary/10">
              <CircleDot className="size-3 text-primary" />
            </span>

            Simple project management for modern teams

            <ChevronRight className="size-3.5 text-muted-foreground" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
            Plan the work.
            <br />
            <span className="text-muted-foreground">
              Move it forward.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            DevFlow gives your team one simple place to plan projects,
            manage tasks, and keep work moving.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link to="/register">
                Get started for free
                
              </Link>
            </Button>

            <Button
              
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              <a href="#features">
                See what's included
                
              </a>
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            {["Projects", "Tasks", "Team members", "Task tracking"].map(
              (item) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5"
                >
                  <Check className="size-3.5" />
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}