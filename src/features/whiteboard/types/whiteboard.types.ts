export type WhiteboardTool =
  | "hand"
  | "select"
  | "rect"
  | "diamond"
  | "ellipse"
  | "arrow"
  | "line"
  | "pen"
  | "text"
  | "sticky"
  | "eraser"

export type FillStyle = "none" | "hachure" | "cross-hatch" | "solid"
export type StrokeStyle = "solid" | "dashed" | "dotted"
export type RoughnessLevel = 0 | 1 | 2
export type RoundnessStyle = "sharp" | "round"

export interface WhiteboardPoint {
  x: number
  y: number
}

export interface WhiteboardElement {
  id: string
  type: Exclude<WhiteboardTool, "select" | "hand" | "eraser">
  x: number
  y: number
  width: number
  height: number
  color: string
  backgroundColor?: string
  fillStyle?: FillStyle
  strokeWidth?: number
  strokeStyle?: StrokeStyle
  roughness?: RoughnessLevel
  roundness?: RoundnessStyle
  opacity?: number
  seed?: number
  fontSize?: number
  textAlign?: "left" | "center" | "right"
  text?: string
  points?: WhiteboardPoint[]
  x2?: number
  y2?: number
}

export interface Whiteboard {
  id: string
  title: string
  workspaceId: string
  projectId: string | null
  projectName: string | null
  createdById: string | null
  createdByName: string
  updatedByName: string
  canvasJson: string
  meetingNotes: string
  version: number
  createdAt: string
  updatedAt: string
}

export interface CreateWhiteboardRequest {
  title: string
  projectId?: string
  canvasJson?: string
  meetingNotes?: string
}

export interface UpdateWhiteboardRequest {
  title: string
  canvasJson: string
  meetingNotes: string
  projectId?: string
  workspaceWide?: boolean
}
