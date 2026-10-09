import { ChevronRight } from "lucide-react";

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
      className="scroll-mt-20 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <Badge variant="secondary">
            Core features
          </Badge>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything stays connected.
          </h2>

          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Projects give your work a home. Tasks turn plans into
            action. Team members know exactly where they fit.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card
                key={feature.title}
                className="group rounded-2xl border-border/70 shadow-none transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <CardContent className="p-6 sm:p-7">
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl border bg-muted/50 transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-5" />
                    </div>

                    <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
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