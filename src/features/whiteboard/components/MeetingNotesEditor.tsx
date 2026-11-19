import { useEffect, useRef } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import Placeholder from "@tiptap/extension-placeholder"
import TaskItem from "@tiptap/extension-task-item"
import TaskList from "@tiptap/extension-task-list"
import StarterKit from "@tiptap/starter-kit"
import {
  Bold,
  CheckSquare,
  Clock,
  Code,
  Copy,
  Download,
  Heading2,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MeetingNotesEditorProps {
  boardId: string
  boardTitle: string
  value: string
  readOnly?: boolean
  onChange: (html: string) => void
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/** Converts legacy plain-text/Markdown notes into clean TipTap HTML. */
function normalizeToHtml(raw: string): string {
  const trimmed = (raw ?? "").trim()
  if (!trimmed) return ""
  if (trimmed.startsWith("<")) return raw

  const lines = raw.split(/\r?\n/)
  const out: string[] = []
  let inUl = false

  const closeUl = () => {
    if (inUl) {
      out.push("</ul>")
      inUl = false
    }
  }

  for (const line of lines) {
    if (line.startsWith("## ")) {
      closeUl()
      out.push(`<h2>${escapeHtml(line.slice(3))}</h2>`)
    } else if (line.startsWith("# ")) {
      closeUl()
      out.push(`<h2>${escapeHtml(line.slice(2))}</h2>`)
    } else if (line.startsWith("- [ ] ") || line.startsWith("- [x] ")) {
      closeUl()
      const checked = line.startsWith("- [x] ")
      out.push(
        `<ul data-type="taskList"><li data-type="taskItem" data-checked="${checked}"><p>${escapeHtml(
          line.slice(6)
        )}</p></li></ul>`
      )
    } else if (line.startsWith("- ")) {
      if (!inUl) {
        out.push("<ul>")
        inUl = true
      }
      out.push(`<li><p>${escapeHtml(line.slice(2))}</p></li>`)
    } else if (line.trim() === "") {
      closeUl()
      out.push("<p></p>")
    } else {
      closeUl()
      out.push(`<p>${escapeHtml(line)}</p>`)
    }
  }
  closeUl()
  return out.join("")
}

export function MeetingNotesEditor({
  boardId,
  boardTitle,
  value,
  readOnly = false,
  onChange,
}: MeetingNotesEditorProps) {
  const lastEmittedRef = useRef<string>(value)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: "Write meeting agenda, decisions, and action items...",
      }),
    ],
    content: normalizeToHtml(value),
    editable: !readOnly,
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML()
      lastEmittedRef.current = html
      onChange(html)
    },
  })

  // Update editability when Presentation Mode changes
  useEffect(() => {
    if (!editor) return
    editor.setEditable(!readOnly)
  }, [editor, readOnly])

  // Sync when switching boards or receiving remote WebSocket updates
  useEffect(() => {
    if (!editor) return
    if (value !== lastEmittedRef.current) {
      lastEmittedRef.current = value
      editor.commands.setContent(normalizeToHtml(value), { emitUpdate: false })
    }
  }, [editor, boardId, value])

  const plainText = editor ? editor.getText() : value.replace(/<[^>]+>/g, " ")
  const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0

  function handleDownload() {
    const content = `# ${boardTitle || "Meeting Notes"}\n\n${plainText}`
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${(boardTitle || "meeting-notes").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
      {/* Rich Text Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 rounded-lg border border-border/70 bg-muted/30 p-1">
        <Button
          type="button"
          size="icon-xs"
          variant={editor?.isActive("bold") ? "secondary" : "ghost"}
          disabled={readOnly}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          title="Bold"
          aria-label="Bold"
        >
          <Bold className="size-3" />
        </Button>
        <Button
          type="button"
          size="icon-xs"
          variant={editor?.isActive("italic") ? "secondary" : "ghost"}
          disabled={readOnly}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          title="Italic"
          aria-label="Italic"
        >
          <Italic className="size-3" />
        </Button>
        <Button
          type="button"
          size="icon-xs"
          variant={editor?.isActive("strike") ? "secondary" : "ghost"}
          disabled={readOnly}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          title="Strikethrough"
          aria-label="Strikethrough"
        >
          <Strikethrough className="size-3" />
        </Button>
        <Button
          type="button"
          size="icon-xs"
          variant={editor?.isActive("code") ? "secondary" : "ghost"}
          disabled={readOnly}
          onClick={() => editor?.chain().focus().toggleCode().run()}
          title="Inline code"
          aria-label="Inline code"
        >
          <Code className="size-3" />
        </Button>

        <div className="mx-0.5 h-4 w-px bg-border/70" />

        <Button
          type="button"
          size="icon-xs"
          variant={editor?.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
          disabled={readOnly}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading"
          aria-label="Heading"
        >
          <Heading2 className="size-3" />
        </Button>
        <Button
          type="button"
          size="icon-xs"
          variant={editor?.isActive("bulletList") ? "secondary" : "ghost"}
          disabled={readOnly}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          title="Bullet list"
          aria-label="Bullet list"
        >
          <List className="size-3" />
        </Button>
        <Button
          type="button"
          size="icon-xs"
          variant={editor?.isActive("orderedList") ? "secondary" : "ghost"}
          disabled={readOnly}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          title="Numbered list"
          aria-label="Numbered list"
        >
          <ListOrdered className="size-3" />
        </Button>
        <Button
          type="button"
          size="icon-xs"
          variant={editor?.isActive("taskList") ? "secondary" : "ghost"}
          disabled={readOnly}
          onClick={() => editor?.chain().focus().toggleTaskList().run()}
          title="Checklist"
          aria-label="Checklist"
        >
          <CheckSquare className="size-3" />
        </Button>
        <Button
          type="button"
          size="icon-xs"
          variant={editor?.isActive("blockquote") ? "secondary" : "ghost"}
          disabled={readOnly}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          title="Blockquote"
          aria-label="Blockquote"
        >
          <Quote className="size-3" />
        </Button>

        <div className="mx-0.5 h-4 w-px bg-border/70" />

        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          disabled={readOnly}
          onClick={() =>
            editor
              ?.chain()
              .focus()
              .insertContent(`[${format(new Date(), "h:mm a")}] `)
              .run()
          }
          title="Insert timestamp"
          aria-label="Insert timestamp"
        >
          <Clock className="size-3" />
        </Button>
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          disabled={readOnly || !editor?.can().undo()}
          onClick={() => editor?.chain().focus().undo().run()}
          title="Undo"
          aria-label="Undo notes"
        >
          <Undo2 className="size-3" />
        </Button>
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          disabled={readOnly || !editor?.can().redo()}
          onClick={() => editor?.chain().focus().redo().run()}
          title="Redo"
          aria-label="Redo notes"
        >
          <Redo2 className="size-3" />
        </Button>
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          onClick={() => void navigator.clipboard?.writeText(plainText)}
          title="Copy notes"
          aria-label="Copy meeting notes"
        >
          <Copy className="size-3" />
        </Button>
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          onClick={handleDownload}
          title="Download notes"
          aria-label="Download meeting notes"
        >
          <Download className="size-3" />
        </Button>
      </div>

      {/* TipTap Editor Surface */}
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto rounded-lg border border-input bg-background/60 p-3 text-xs leading-relaxed",
          "[&_.ProseMirror]:min-h-full [&_.ProseMirror]:outline-none",
          "[&_.ProseMirror_h2]:mt-2 [&_.ProseMirror_h2]:mb-1 [&_.ProseMirror_h2]:text-sm [&_.ProseMirror_h2]:font-semibold",
          "[&_.ProseMirror_p]:my-1",
          "[&_.ProseMirror_ul]:my-1 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5",
          "[&_.ProseMirror_ol]:my-1 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5",
          "[&_.ProseMirror_ul[data-type='taskList']]:list-none [&_.ProseMirror_ul[data-type='taskList']]:pl-0",
          "[&_.ProseMirror_ul[data-type='taskList']_li]:flex [&_.ProseMirror_ul[data-type='taskList']_li]:items-start [&_.ProseMirror_ul[data-type='taskList']_li]:gap-2",
          "[&_.ProseMirror_ul[data-type='taskList']_li>label]:mt-0.5 [&_.ProseMirror_ul[data-type='taskList']_li>label>input]:accent-primary",
          "[&_.ProseMirror_blockquote]:my-1.5 [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-primary/60 [&_.ProseMirror_blockquote]:pl-3 [&_.ProseMirror_blockquote]:text-muted-foreground",
          "[&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-[11px]",
          "[&_.ProseMirror_.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]"
        )}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Word & Character Count */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{wordCount} words</span>
        <span>{plainText.length} chars</span>
      </div>
    </div>
  )
}
