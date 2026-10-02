import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Features from "./Features";

export default function ProductWording() {
  return (
    <div className="flex min-h-[70vh] max-w-lg flex-col justify-between">
      <div>
        <div className="text-3xl font-bold">
          The developer-first execution and sprint platform.
        </div>
        <div className="mt-2 text-sm leading-relaxed">
          Built specifically for engineering teams needing lightning-fast issue
          tracking, sprint cycles, and pull request intelligence without bloated
          bureaucracy.
        </div>
      </div>
      
      <Features/>
      <div className="rounded-md border-2 p-4 text-sm">
        <div className="italic">
          "DevFlow reduced our sprint setup time to zero. The fastest
          engineering onboarding we have deployed to date."
        </div>
        <div className="flex flex-row gap-2 p-2 items-center">
          <Avatar>
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          Lead Staff Engineer
        </div>
      </div>
    </div>
  )
}
