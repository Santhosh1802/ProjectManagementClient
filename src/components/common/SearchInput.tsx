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
  const hasValue = Boolean(props.value)

  return (
    <div className={cn("relative w-full flex items-center", containerClassName)}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        className={cn(
          "w-full pl-8 bg-background",
          showKbdHint ? "pr-9" : "pr-3",
          className
        )}
        {...props}
      />
      {showKbdHint && !hasValue && (
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:flex items-center">
          <Kbd aria-hidden="true">/</Kbd>
        </div>
      )}
    </div>
  )
}
