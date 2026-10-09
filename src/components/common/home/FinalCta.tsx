
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import LogoWithVersion from "../LogoWithVersion";

export default function FinalCta() {
  return (
    <section className="pb-20 sm:pb-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden rounded-2xl border-border/70">
          <CardContent className="relative px-6 py-14 text-center sm:px-10 sm:py-16">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-primary),transparent_60%)] opacity-[0.08]" />

            <div className="relative">
              <div className="mx-auto flex w-fit items-center justify-center rounded-xl bg-muted">
                <LogoWithVersion/>
              </div>

              <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to get work moving?
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Create your first project and see how simple project
                management can be.
              </p>

              <Button
                
                size="lg"
                className="mt-7"
              >
                <Link to="/register">
                  Create your workspace
                  
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}