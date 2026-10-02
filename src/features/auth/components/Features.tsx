import { Separator } from "@/components/ui/separator"
import { CircleCheck } from "lucide-react"

export default function Features() {
  const features: string[] = [
    "Streamlined sprint tracking calibrated for fast-moving squads",
    "Strict keyboard-driven workflow with zero configuration bloat",
    "Standardized enterprise-ready credential & auth policies",
  ]
  return (
    <div className="flex flex-col gap-4">
      <Separator />
      {features.map((feature, index) => (
        <div className="flex flex-col gap-2" key={index}>
          <div className="flex flex-row items-center gap-2">
            <CircleCheck className="size-4 fill-green-100 text-green-400" /> <p className="text-sm">{feature}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
