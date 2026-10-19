import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface PageSizeSelectorProps {
  value: number
  onChange: (value: number) => void
  options?: number[]
}

export default function PageSizeSelector({
  value,
  onChange,
  options = [10, 20, 50, 100],
}: PageSizeSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
      <span>Show</span>
      <Select
        value={String(value)}
        onValueChange={(val) => {
          if (val) {
            onChange(Number(val))
          }
        }}
      >
        <SelectTrigger className="h-7 w-16 px-2 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {options.map((opt) => (
            <SelectItem key={opt} value={String(opt)}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="hidden sm:inline">per page</span>
    </div>
  )
}
