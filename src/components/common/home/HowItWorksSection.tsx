import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { workflowSteps } from "@/features/auth/utils/home.data";

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <Badge variant="secondary">
              Simple workflow
            </Badge>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              From idea to done.
            </h2>

            <p className="mt-4 max-w-lg leading-7 text-muted-foreground">
              Create a project, break the work into tasks, assign
              responsibility, and keep everything moving.
            </p>

            <Button
              
              className="mt-7"
            >
              <Link to="/register">
                Create your first project
                
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            {workflowSteps.map((step) => (
              <div
                key={step.number}
                className="group flex gap-5 rounded-xl border bg-background p-5 transition-colors hover:border-foreground/20 sm:p-6"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-semibold">
                  {step.number}
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold">
                    {step.title}
                  </h3>

                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                <CheckCircle2 className="ml-auto mt-1 hidden size-5 shrink-0 text-muted-foreground sm:block" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}