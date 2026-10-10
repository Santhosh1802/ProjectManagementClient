import Features from "./Features";

export default function ProductWording() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-10">
      <div className="space-y-4">
        <div className="text-sm font-medium text-muted-foreground">
          DEVFLOW
        </div>

        <h1 className="text-4xl font-semibold tracking-tight xl:text-5xl">
          Build better.
          <br />
          Ship faster.
        </h1>

        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          A simple workspace for engineering teams to plan projects,
          manage tasks, and keep development moving.
        </p>
      </div>

      <Features />

      <p className="text-xs text-muted-foreground">
        Built for developers. Designed to stay out of your way.
      </p>
    </div>
  );
}