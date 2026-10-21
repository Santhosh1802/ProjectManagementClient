import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  showKbdHint?: boolean;
}

export default function SearchInput({
  containerClassName,
  className,
  showKbdHint = true,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative w-full flex items-center", containerClassName)}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        className={cn("w-full pl-8 pr-8 bg-background", className)}
        {...props}
      />
      {showKbdHint && (
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center">
          <Kbd className="h-4.5 min-w-4.5 px-1 text-[10px] bg-muted/80 border border-border/60 text-muted-foreground font-mono">
            /
          </Kbd>
        </div>
      )}
    </div>
  );
}
