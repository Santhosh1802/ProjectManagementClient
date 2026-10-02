import {Badge} from "@/components/ui/badge.tsx";

export default function LogoWithVersion(){
    return (
        <div className="flex flex-row items-center justify-center gap-2 p-2 w-fit hover:cursor-pointer">
            <img src="/logo.png" alt="logo" width="40" height="40" />
            <p className="font-semibold text-lg">DevFlow</p>
            <Badge variant="outline" className="font-mono font-light text-xs">v{import.meta.env.VITE_APP_VERSION}</Badge>
        </div>
    )
}