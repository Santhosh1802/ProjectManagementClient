import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { productPrinciples } from "@/features/auth/utils/home.data";

export default function WhyDevFlowSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border bg-muted/20 p-7 sm:p-10 lg:p-12">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <Badge variant="secondary">
                Why DevFlow
              </Badge>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Less complexity.
                <br />
                More clarity.
              </h2>

              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                DevFlow focuses on the things teams actually work with
                every day: projects, tasks, people, priorities, and
                deadlines.
              </p>
            </div>

            <div className="space-y-3">
              {productPrinciples.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3"
                >
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="size-3.5 text-primary" />
                  </div>

                  <span className="text-sm font-medium">
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