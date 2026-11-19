import { useEffect, useMemo, useRef, useState } from "react"
import { Excalidraw } from "@excalidraw/excalidraw"
import "@excalidraw/excalidraw/index.css"
import { useAppSelector } from "@/hooks/redux-hooks"
import type { WhiteboardSettings } from "../hooks/useWhiteboardSettings"

interface WhiteboardCanvasProps {
  boardId: string
  canvasJson: string
  settings?: WhiteboardSettings
  onChangeJson: (nextJson: string) => void
}

interface StoredScene {
  elements?: readonly Record<string, unknown>[]
  appState?: {
    viewBackgroundColor?: string
    gridSize?: number
  }
}

function parseExcalidrawScene(json: string): StoredScene {
  try {
    const parsed = JSON.parse(json) as unknown
    if (Array.isArray(parsed)) {
      // Only pass elements that look like native Excalidraw elements (have versionNonce/type)
      const valid = parsed.filter(
        (el): el is Record<string, unknown> =>
          typeof el === "object" && el !== null && "versionNonce" in el
      )
      return { elements: valid }
    }
    if (typeof parsed === "object" && parsed !== null && "elements" in parsed) {
      return parsed as StoredScene
    }
    return { elements: [] }
  } catch {
    return { elements: [] }
  }
}

function getElementsSignature(
  elements: readonly { id?: string; version?: number; isDeleted?: boolean }[]
): string {
  return elements
    .map((el) => `${el.id ?? ""}:${el.version ?? 0}:${el.isDeleted ? 1 : 0}`)
    .join("|")
}

export function WhiteboardCanvas({
  boardId,
  canvasJson,
  settings,
  onChangeJson,
}: WhiteboardCanvasProps) {
  const themeMode = useAppSelector((state) => state.theme.theme)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const excalidrawApiRef = useRef<any>(null)
  const lastEmittedSigRef = useRef<string>("")
  const [excalidrawTheme, setExcalidrawTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    if (themeMode === "dark") {
      setExcalidrawTheme("dark")
      return
    }
    if (themeMode === "light") {
      setExcalidrawTheme("light")
      return
    }
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)")
    setExcalidrawTheme(mq?.matches ? "dark" : "light")
  }, [themeMode])

  const initialScene = useMemo(() => {
    const parsed = parseExcalidrawScene(canvasJson)
    const els = parsed.elements ?? []
    lastEmittedSigRef.current = getElementsSignature(
      els as readonly { id?: string; version?: number; isDeleted?: boolean }[]
    )
    return {
      elements: els,
      appState: {
        ...parsed.appState,
        gridSize: settings?.gridSize ?? parsed.appState?.gridSize ?? 20,
      },
    }
    // Recompute initialData only when switching boards
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardId])

  // Apply remote real-time updates from WebSocket to the live Excalidraw scene
  useEffect(() => {
    const api = excalidrawApiRef.current
    if (!api) return
    const parsed = parseExcalidrawScene(canvasJson)
    const els = (parsed.elements ?? []) as readonly {
      id?: string
      version?: number
      isDeleted?: boolean
    }[]
    const incomingSig = getElementsSignature(els)
    if (incomingSig !== lastEmittedSigRef.current) {
      lastEmittedSigRef.current = incomingSig
      api.updateScene({ elements: els })
    }
  }, [canvasJson])

  return (
    <div
      data-testid="excalidraw-wrapper"
      className="relative h-full min-h-0 w-full overflow-hidden rounded-xl border border-border/80 bg-card shadow-inner"
    >
      <Excalidraw
        key={boardId}
        excalidrawAPI={(api) => {
          excalidrawApiRef.current = api
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialData={initialScene as any}
        theme={excalidrawTheme}
        viewModeEnabled={settings?.readOnlyMode ?? false}
        gridModeEnabled={(settings?.defaultGridMode ?? "dots") !== "none"}
        UIOptions={{
          canvasActions: {
            loadScene: false,
            saveToActiveFile: false,
            toggleTheme: false,
          },
        }}
        onChange={(elements, appState) => {
          const sig = getElementsSignature(elements)
          if (sig === lastEmittedSigRef.current) return
          lastEmittedSigRef.current = sig
          onChangeJson(
            JSON.stringify({
              elements,
              appState: {
                viewBackgroundColor: appState.viewBackgroundColor,
                gridSize: appState.gridSize,
              },
            })
          )
        }}
      />
    </div>
  )
}
