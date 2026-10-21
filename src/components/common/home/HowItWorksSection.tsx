import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { workflowSteps } from "@/features/auth/utils/home.data";

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-20 py-20 sm:py-28 bg-muted/20 border-y border-border/60"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <Badge variant="secondary" className="px-3 py-1 font-semibold text-primary bg-primary/10 border-primary/20">
              Zero Confusion Workflow
            </Badge>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              From conception to verified delivery.
            </h2>

            <p className="mt-4 max-w-lg text-sm sm:text-base leading-7 text-muted-foreground">
              Define projects, designate managers, assign granular work items, and track completion through our Spring Boot + React Query powered engine.
            </p>

            <div className="mt-8 flex items-center gap-4">
              <Button
                size="lg"
                className="group h-11 px-6 shadow-xs"
                render={<Link to="/register" />}
              >
                <span>Launch Workspace</span>
                <ArrowRight className="size-4 ml-1.5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Workflow Step Cards */}
          <div className="space-y-4">
            {workflowSteps.map((step) => (
              <div
                key={step.number}
                className="group relative flex gap-5 rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {step.number}
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-foreground">
                    {step.title}
                  </h3>

                  <p className="mt-1.5 text-xs sm:text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                <CheckCircle2 className="ml-auto mt-1 hidden size-5 shrink-0 text-primary/40 group-hover:text-primary sm:block transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}