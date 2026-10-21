import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { features } from "@/features/auth/utils/home.data";

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative scroll-mt-20 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <Badge variant="secondary" className="px-3 py-1 font-semibold text-primary bg-primary/10 border-primary/20">
            Engineered Capabilities
          </Badge>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Built for modern engineering & delivery teams.
          </h2>

          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Everything you need to orchestrate workspaces, govern permissions, track tasks across Kanban boards, and work in high-contrast personalized themes.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 p-1 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl backdrop-blur-xs"
              >
                {/* MagicUI Style top shimmer edge */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <CardContent className="flex h-full flex-col p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl border border-border/80 bg-muted/60 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-xs">
                      <Icon className="size-5" />
                    </div>

                    <div className="flex items-center gap-2">
                      {feature.tag && (
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-primary">
                          {feature.tag}
                        </span>
                      )}
                      <ArrowUpRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                    </div>
                  </div>

                  <h3 className="mt-5 text-base font-bold text-foreground">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}