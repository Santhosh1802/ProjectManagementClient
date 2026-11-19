export interface MentionableMember {
  id: string
  firstName: string
  lastName?: string | null
  email: string
}

export interface ActiveMentionMatch {
  query: string
  startIndex: number
  endIndex: number
}

/**
 * Matches @email tokens consistent with backend CommentService.MENTION_EMAIL_PATTERN.
 */
export const MENTION_EMAIL_REGEX =
  /(@[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/g

export const MENTION_EMAIL_EXACT_REGEX =
  /^@([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})$/

/**
 * Detects an active @mention query immediately preceding the textarea cursor.
 */
export function detectActiveMention(
  text: string,
  cursorPos: number
): ActiveMentionMatch | null {
  const safeCursor = Math.max(0, Math.min(cursorPos, text.length))
  const textBeforeCursor = text.slice(0, safeCursor)

  let atIndex = -1
  for (let i = textBeforeCursor.length - 1; i >= 0; i -= 1) {
    const ch = textBeforeCursor[i]
    if (ch === "@") {
      if (i === 0 || /\s/.test(textBeforeCursor[i - 1])) {
        atIndex = i
      }
      break
    }
    if (/\s/.test(ch)) {
      break
    }
  }

  if (atIndex === -1) {
    return null
  }

  return {
    query: textBeforeCursor.slice(atIndex + 1),
    startIndex: atIndex,
    endIndex: safeCursor,
  }
}

/**
 * Filters and deduplicates mentionable members by name or email.
 */
export function filterMentionCandidates(
  members: MentionableMember[],
  query: string,
  limit = 6
): MentionableMember[] {
  const q = query.trim().toLowerCase()
  const seenEmails = new Set<string>()
  const matches: MentionableMember[] = []

  for (const member of members) {
    if (!member.email) continue
    const normalizedEmail = member.email.toLowerCase()
    if (seenEmails.has(normalizedEmail)) continue

    const fullName = `${member.firstName ?? ""} ${member.lastName ?? ""}`
      .trim()
      .toLowerCase()

    if (
      !q ||
      fullName.includes(q) ||
      (member.firstName ?? "").toLowerCase().includes(q) ||
      (member.lastName ?? "").toLowerCase().includes(q) ||
      normalizedEmail.includes(q)
    ) {
      seenEmails.add(normalizedEmail)
      matches.push(member)
      if (matches.length >= limit) break
    }
  }

  return matches
}

/**
 * Replaces the active @query token with `@email ` and returns the new text & cursor position.
 */
export function applyMentionSelection(
  text: string,
  startIndex: number,
  endIndex: number,
  email: string
): { nextValue: string; nextCursorPos: number } {
  const inserted = `@${email} `
  const nextValue = text.slice(0, startIndex) + inserted + text.slice(endIndex)
  return {
    nextValue,
    nextCursorPos: startIndex + inserted.length,
  }
}
