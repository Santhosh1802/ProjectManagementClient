import { Laptop, Moon, Sun } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks"
import { setTheme, type Theme } from "@/app/slice/themeSlice"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import PageContainer from "@/components/common/PageContainer"
import PageHeader from "@/components/common/PageHeader"

export default function Settings() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.theme.theme)

  const handleThemeChange = (selectedTheme: string | null) => {
    dispatch(setTheme(selectedTheme as Theme))
  }

  return (
    <PageContainer>
      <PageHeader 
        title="Settings" 
        description="Manage your workspace preferences." 
      />

      <div className="flex w-full flex-col gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize the look and feel of your workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="theme" className="font-semibold">
                Theme Preference
              </Label>
              <div className="max-w-md">
                <Select value={theme} onValueChange={handleThemeChange}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center gap-2">
                        <Sun className="size-4 text-muted-foreground" />
                        <span>Light</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center gap-2">
                        <Moon className="size-4 text-muted-foreground" />
                        <span>Dark</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Laptop className="size-4 text-muted-foreground" />
                        <span>System</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-[0.8rem] text-muted-foreground mt-1">
                Automatically match your system settings or choose a specific theme.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  )
}
