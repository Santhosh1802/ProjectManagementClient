import { useState } from "react"
import {
  Check,
  Code2,
  Copy,
  CornerDownRight,
  Download,
  ExternalLink,
  FileText,
} from "lucide-react"
import {
  formatBytes,
  resolveBackendFileUrl,
} from "@/features/projects/services/projectStorage.service"
import { cn } from "@/lib/utils"

export interface ExtractedLink {
  url: string
  messageId: string
  senderName: string
  createdAt: string
}

export interface ExtractedCodeSnippet {
  language: string
  code: string
  messageId: string
  senderName: string
  createdAt: string
}

const URL_REGEX = /(https?:\/\/[^\s<>"')]+)/g
const CODE_BLOCK_REGEX = /```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g

export function extractUrlsFromText(text: string): string[] {
  const matches = text.match(URL_REGEX)
  if (!matches) return []
  return Array.from(new Set(matches))
}

export function extractCodeBlocksFromText(
  text: string
): { language: string; code: string }[] {
  const results: { language: string; code: string }[] = []
  let match: RegExpExecArray | null
  const regex = new RegExp(CODE_BLOCK_REGEX.source, "g")
  while ((match = regex.exec(text)) !== null) {
    const language = (match[1] || "text").trim()
    const code = (match[2] || "").trim()
    if (code) {
      results.push({ language, code })
    }
  }
  return results
}

interface ChatMessageContentProps {
  content: string
  isOwn: boolean
  replyPreview?: string | null
  replyToId?: string | null
  replySenderName?: string | null
  attachmentUrl?: string | null
  attachmentName?: string | null
  attachmentType?: string | null
  attachmentSize?: number | null
  onJumpToMessage?: (messageId: string) => void
}

function CodeBlockCard({
  language,
  code,
  isOwn,
}: {
  language: string
  code: string
  isOwn: boolean
}) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    void navigator.clipboard?.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className={cn(
        "my-1.5 overflow-hidden rounded-lg border text-xs",
        isOwn
          ? "border-primary-foreground/25 bg-black/25 text-primary-foreground"
          : "border-border bg-muted/80 text-foreground"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between border-b px-2.5 py-1 text-[10px] font-medium",
          isOwn
            ? "border-primary-foreground/20 bg-black/20 text-primary-foreground/85"
            : "border-border/80 bg-muted text-muted-foreground"
        )}
      >
        <span className="inline-flex items-center gap-1 font-mono uppercase">
          <Code2 className="size-3" />
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:bg-black/15"
          aria-label="Copy code block"
        >
          {copied ? (
            <>
              <Check className="size-2.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-2.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="max-w-full overflow-x-auto p-2.5 font-mono text-[11px] leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function renderInlineTokens(text: string, isOwn: boolean): React.ReactNode[] {
  const tokenRegex =
    /(`[^`\n]+`|\*\*[^*\n]+\*\*|https?:\/\/[^\s<>"')]+|@[a-zA-Z0-9_.-]+)/g
  const parts = text.split(tokenRegex)

  return parts.map((part, idx) => {
    if (!part) return null

    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={idx}
          className={cn(
            "rounded px-1.5 py-0.5 font-mono text-[11px]",
            isOwn
              ? "bg-black/25 text-primary-foreground"
              : "border border-border/60 bg-muted text-foreground"
          )}
        >
          {part.slice(1, -1)}
        </code>
      )
    }

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      )
    }

    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={idx}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-0.5 font-medium underline underline-offset-2 transition-opacity hover:opacity-85",
            isOwn ? "text-primary-foreground" : "text-primary"
          )}
        >
          <span className="break-all">{part}</span>
          <ExternalLink className="size-2.5 shrink-0" />
        </a>
      )
    }

    if (/^@[a-zA-Z0-9_.-]+$/.test(part)) {
      return (
        <span
          key={idx}
          className={cn(
            "inline-flex items-center rounded-md px-1.5 py-0.2 text-xs font-semibold",
            isOwn
              ? "bg-white/20 text-primary-foreground"
              : "bg-primary/15 text-primary"
          )}
        >
          {part}
        </span>
      )
    }

    return <span key={idx}>{part}</span>
  })
}

export function ChatMessageContent({
  content,
  isOwn,
  replyPreview,
  replyToId,
  replySenderName,
  attachmentUrl,
  attachmentName,
  attachmentType,
  attachmentSize,
  onJumpToMessage,
}: ChatMessageContentProps) {
  const segments: (
    | { type: "text"; value: string }
    | { type: "code"; language: string; code: string }
  )[] = []

  let lastIndex = 0
  let match: RegExpExecArray | null
  const regex = new RegExp(CODE_BLOCK_REGEX.source, "g")

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        value: content.slice(lastIndex, match.index),
      })
    }
    segments.push({
      type: "code",
      language: (match[1] || "text").trim(),
      code: (match[2] || "").replace(/^\n+|\n+$/g, ""),
    })
    lastIndex = regex.lastIndex
  }

  if (lastIndex < content.length) {
    segments.push({
      type: "text",
      value: content.slice(lastIndex),
    })
  }

  if (segments.length === 0) {
    segments.push({ type: "text", value: content })
  }

  const resolvedAttachmentUrl = resolveBackendFileUrl(attachmentUrl)
  const isImageAttachment =
    Boolean(resolvedAttachmentUrl) &&
    (attachmentType?.startsWith("image/") ||
      /\.(png|jpe?g|gif|webp|svg)$/i.test(attachmentName ?? ""))

  return (
    <div className="space-y-1.5">
      {replyPreview && (
        <button
          type="button"
          onClick={() => {
            if (replyToId && onJumpToMessage) onJumpToMessage(replyToId)
          }}
          className={cn(
            "flex w-full items-start gap-2 rounded-lg border-l-2 px-2.5 py-1.5 text-left text-xs transition-colors",
            isOwn
              ? "border-l-white/80 bg-black/20 text-primary-foreground/90 hover:bg-black/30"
              : "border-l-primary bg-muted/70 text-muted-foreground hover:bg-muted"
          )}
        >
          <CornerDownRight className="mt-0.5 size-3 shrink-0 opacity-75" />
          <div className="min-w-0 flex-1">
            {replySenderName && (
              <div
                className={cn(
                  "truncate text-[11px] font-semibold",
                  isOwn ? "text-primary-foreground" : "text-primary"
                )}
              >
                {replySenderName}
              </div>
            )}
            <div className="line-clamp-2 break-words text-[11px] opacity-90">
              {replyPreview}
            </div>
          </div>
        </button>
      )}

      {/* Image or File Attachment Card */}
      {resolvedAttachmentUrl && (
        <div className="pt-0.5">
          {isImageAttachment ? (
            <div className="overflow-hidden rounded-xl border border-border/60 bg-black/10">
              <a
                href={resolvedAttachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <img
                  src={resolvedAttachmentUrl}
                  alt={attachmentName ?? "Attached image"}
                  className="max-h-60 w-auto max-w-full rounded-t-xl object-contain"
                />
              </a>
              <div
                className={cn(
                  "flex items-center justify-between gap-2 px-2.5 py-1 text-[10px]",
                  isOwn
                    ? "bg-black/20 text-primary-foreground/90"
                    : "bg-muted/70 text-muted-foreground"
                )}
              >
                <span className="truncate font-medium">
                  {attachmentName ?? "Image"}
                </span>
                <a
                  href={resolvedAttachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={attachmentName ?? "image"}
                  className="inline-flex shrink-0 items-center gap-1 font-semibold hover:underline"
                >
                  <Download className="size-2.5" />
                  {formatBytes(attachmentSize)}
                </a>
              </div>
            </div>
          ) : (
            <a
              href={resolvedAttachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              download={attachmentName ?? "file"}
              className={cn(
                "flex items-center justify-between gap-2.5 rounded-xl border p-2.5 text-xs transition-colors",
                isOwn
                  ? "border-primary-foreground/25 bg-black/20 text-primary-foreground hover:bg-black/30"
                  : "border-border bg-muted/60 text-foreground hover:bg-muted"
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    isOwn
                      ? "bg-white/20 text-primary-foreground"
                      : "bg-primary/15 text-primary"
                  )}
                >
                  <FileText className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {attachmentName ?? "Attachment"}
                  </p>
                  <p className="text-[10px] opacity-80">
                    {formatBytes(attachmentSize)}
                  </p>
                </div>
              </div>
              <Download className="size-3.5 shrink-0 opacity-85" />
            </a>
          )}
        </div>
      )}

      <div className="space-y-1 text-[13.5px] leading-relaxed break-words whitespace-pre-wrap">
        {segments.map((seg, i) =>
          seg.type === "code" ? (
            <CodeBlockCard
              key={i}
              language={seg.language}
              code={seg.code}
              isOwn={isOwn}
            />
          ) : (
            <span key={i}>{renderInlineTokens(seg.value, isOwn)}</span>
          )
        )}
      </div>
    </div>
  )
}
