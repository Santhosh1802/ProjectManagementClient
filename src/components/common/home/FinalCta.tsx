
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import LogoWithVersion from "../LogoWithVersion";

export default function FinalCta() {
  return (
    <section className="pb-20 sm:pb-28 relative">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Card className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/80 shadow-2xl backdrop-blur-md">
          {/* MagicUI Style Pulsing Background Gradient Beam */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,var(--primary),transparent_70%)] opacity-15 blur-2xl" />

          <CardContent className="relative px-6 py-14 text-center sm:px-12 sm:py-20">
            <div className="mx-auto flex w-fit items-center justify-center rounded-2xl bg-muted/70 p-2 border border-border/60 shadow-2xs">
              <LogoWithVersion />
            </div>

            <h2 className="mt-7 text-3xl font-extrabold tracking-tight sm:text-5xl">
              Take complete command of your delivery.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base leading-7 text-muted-foreground">
              Sign up today and leverage role-based project workspaces, custom task views, and instant theme customization.
            </p>

            <div className="mt-8 flex flex-col justify-center items-center gap-3 sm:flex-row">
              <Button
                size="lg"
                className="group h-12 px-8 text-sm font-semibold shadow-md transition-all hover:shadow-lg"
                render={<Link to="/register" />}
              >
                <span>Create Workspace Now</span>
                <ArrowRight className="size-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 border-border/80 bg-background/60 hover:bg-muted/60"
                render={<Link to="/login" />}
              >
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}