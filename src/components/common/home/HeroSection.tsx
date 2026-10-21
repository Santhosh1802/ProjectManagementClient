import { ArrowRight, Command, Kanban, Palette, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
      {/* MagicUI Style Background Gradient Beams & Dot Grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-dot-pattern text-foreground/[0.04] [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_80%)]" />

      {/* Floating Ambient Glow Orbs */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[750px] rounded-full bg-primary/15 blur-[120px] animate-pulse-slow" />
      <div className="pointer-events-none absolute top-1/3 left-1/3 -z-10 h-[300px] w-[400px] rounded-full bg-primary/10 blur-[90px] animate-float-gentle" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* MagicUI Animated Pill */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary shadow-xs backdrop-blur-md transition-all hover:bg-primary/10">
            <Sparkles className="size-3.5 text-primary animate-pulse" />
            <span className="font-semibold tracking-wide">DevFlow SaaS Version 1.0</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-foreground/80">RBAC, Kanban & Custom Themes</span>
            <ArrowRight className="size-3.5 text-primary/70" />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            Streamlined Project & Task Management{" "}
            <span className="relative inline-block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Engineered for Velocity.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            Experience role-based project coordination, Kanban drag-and-drop workflows, member-scoped task visibility, and customizable developer themes.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              className="group relative overflow-hidden h-11 px-6 shadow-md transition-all hover:shadow-lg"
              render={<Link to="/register" />}
            >
              <span className="relative z-10 flex items-center gap-2 font-semibold">
                Get Started Free
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-11 px-6 border-border/80 bg-background/60 backdrop-blur hover:bg-muted/60"
              render={<a href="#features" />}
            >
              Explore Live Features
            </Button>
          </div>

          {/* Real Version 1 Feature Badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-medium text-foreground/85">
            <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background/70 px-3 py-1.5 shadow-2xs backdrop-blur">
              <ShieldCheck className="size-3.5 text-primary" />
              Role Guard & RBAC (Admin, Manager, Member)
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background/70 px-3 py-1.5 shadow-2xs backdrop-blur">
              <Kanban className="size-3.5 text-primary" />
              Interactive Kanban & Card Views
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background/70 px-3 py-1.5 shadow-2xs backdrop-blur">
              <Palette className="size-3.5 text-primary" />
              5 VS Code Developer Themes
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background/70 px-3 py-1.5 shadow-2xs backdrop-blur">
              <Command className="size-3.5 text-primary" />
              Shortcuts & Quick Filter
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}