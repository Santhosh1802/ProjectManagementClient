import { Spinner } from "@/components/ui/spinner";

interface AppLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function AppLoader({
  message = "Loading DevFlow...",
  fullScreen = true,
}: AppLoaderProps) {
  return (
    <div
      className={
        fullScreen
          ? "flex min-h-screen w-full items-center justify-center bg-background"
          : "flex w-full items-center justify-center py-10"
      }
    >
      <div className="flex flex-col items-center gap-4">
        {/* Animated logo */}
        <div className="relative">
          {/* Outer glow */}
          <div className="absolute inset-0 animate-ping rounded-xl bg-primary/20" />

          {/* Logo container */}
          <div className="relative flex size-12 animate-pulse items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Spinner className="size-6 animate-spin" />
          </div>
        </div>

        {/* Loading message */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>{message}</span>

          <span className="flex w-6">
            <span className="animate-bounce [animation-delay:0ms]">.</span>
            <span className="animate-bounce [animation-delay:150ms]">.</span>
            <span className="animate-bounce [animation-delay:300ms]">.</span>
          </span>
        </div>
      </div>
    </div>
  );
}