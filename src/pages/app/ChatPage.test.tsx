import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Provider } from "react-redux"
import { MemoryRouter } from "react-router-dom"
import { configureStore } from "@reduxjs/toolkit"
import themeReducer from "@/app/slice/themeSlice"
import authReducer from "@/features/auth/slice/authSlice"
import ChatPage from "./ChatPage"
import * as chatQueries from "@/features/chat/hooks/useChatQuery"
import * as chatService from "@/features/chat/services/chat.service"

vi.mock("emoji-picker-react", () => ({
  default: () => <div data-testid="emoji-picker-mock" />,
  Theme: { DARK: "dark", LIGHT: "light" },
}))
vi.mock("@/features/projects/hooks/useProjectsQuery", () => ({
  useProjectsQuery: vi.fn(() => ({ data: [{ id: "p-1", name: "Core API" }] })),
}))
vi.mock("@/features/users/services/users.service", () => ({
  searchUsers: vi.fn(async () => ({
    content: [
      { id: "u-2", firstName: "Bob", lastName: "Smith", email: "bob@example.com" },
    ],
  })),
}))
vi.mock("@/features/chat/services/chat.service", async (importOriginal) => {
  const actual = await importOriginal<typeof chatService>()
  return {
    ...actual,
    getChannelMessages: vi.fn(async () => []),
  }
})
vi.mock("@/features/chat/hooks/useChatQuery", () => ({
  CHAT_KEYS: {
    channels: (projectId?: string) => ["chat", "channels", projectId ?? "all"] as const,
    messages: (channelId: string) => ["chat", "messages", channelId] as const,
    search: (channelId: string, query: string) =>
      ["chat", "messages-search", channelId, query] as const,
  },
  useChatChannelsQuery: vi.fn(),
  useCreateChatChannelMutation: vi.fn(),
  useUpdateChatChannelMutation: vi.fn(),
  useStartDirectChatMutation: vi.fn(),
  useChannelMessagesQuery: vi.fn(),
  useSendChannelMessageMutation: vi.fn(),
  useUploadChatAttachmentMutation: vi.fn(),
  useEditChannelMessageMutation: vi.fn(),
  useToggleMessageReactionMutation: vi.fn(),
  useTogglePinMessageMutation: vi.fn(),
  useDeleteChannelMessageMutation: vi.fn(),
  useRealtimeChat: vi.fn(),
}))

function setupDefaultMutations() {
  const noop = { mutate: vi.fn(), isPending: false }
  vi.mocked(chatQueries.useCreateChatChannelMutation).mockReturnValue(
    noop as unknown as ReturnType<typeof chatQueries.useCreateChatChannelMutation>
  )
  vi.mocked(chatQueries.useUpdateChatChannelMutation).mockReturnValue(
    noop as unknown as ReturnType<typeof chatQueries.useUpdateChatChannelMutation>
  )
  vi.mocked(chatQueries.useStartDirectChatMutation).mockReturnValue(
    noop as unknown as ReturnType<typeof chatQueries.useStartDirectChatMutation>
  )
  vi.mocked(chatQueries.useSendChannelMessageMutation).mockReturnValue(
    noop as unknown as ReturnType<typeof chatQueries.useSendChannelMessageMutation>
  )
  const uploadMock = { mutate: vi.fn(), isPending: false }
  vi.mocked(chatQueries.useUploadChatAttachmentMutation).mockReturnValue(
    uploadMock as unknown as ReturnType<typeof chatQueries.useUploadChatAttachmentMutation>
  )
  vi.mocked(chatQueries.useEditChannelMessageMutation).mockReturnValue(
    noop as unknown as ReturnType<typeof chatQueries.useEditChannelMessageMutation>
  )
  vi.mocked(chatQueries.useToggleMessageReactionMutation).mockReturnValue(
    noop as unknown as ReturnType<typeof chatQueries.useToggleMessageReactionMutation>
  )
  vi.mocked(chatQueries.useTogglePinMessageMutation).mockReturnValue(
    noop as unknown as ReturnType<typeof chatQueries.useTogglePinMessageMutation>
  )
  vi.mocked(chatQueries.useDeleteChannelMessageMutation).mockReturnValue(
    noop as unknown as ReturnType<typeof chatQueries.useDeleteChannelMessageMutation>
  )
  return { uploadMock }
}

function renderChat() {
  const store = configureStore({
    reducer: { theme: themeReducer, auth: authReducer },
  })
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ChatPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  )
}

function setupDefaultChannelsAndMessages() {
  vi.mocked(chatQueries.useChatChannelsQuery).mockReturnValue({
    isLoading: false,
    data: [
      {
        id: "ch-1",
        name: "General Workspace Chat",
        description: "Team chat",
        workspaceId: "ws-1",
        projectId: null,
        projectName: null,
        createdByName: "Alice",
        lastMessageAt: new Date().toISOString(),
        lastMessagePreview: "Welcome to team chat!",
        messageCount: 3,
        createdAt: new Date().toISOString(),
      },
      {
        id: "ch-2",
        name: "Core API Standup",
        description: "Project only",
        workspaceId: "ws-1",
        projectId: "p-1",
        projectName: "Core API",
        createdByName: "Alice",
        lastMessageAt: new Date().toISOString(),
        lastMessagePreview: "Deploying v2",
        messageCount: 1,
        createdAt: new Date().toISOString(),
      },
    ],
  } as unknown as ReturnType<typeof chatQueries.useChatChannelsQuery>)

  vi.mocked(chatQueries.useChannelMessagesQuery).mockReturnValue({
    isLoading: false,
    data: [
      {
        id: "m-1",
        channelId: "ch-1",
        senderId: "u-1",
        senderName: "Alice",
        senderEmail: "alice@example.com",
        content: "Welcome to team chat! Check https://docs.example.com and @everyone",
        replyToId: null,
        replyPreview: null,
        edited: false,
        pinned: false,
        reactions: { "👍": ["alice@example.com"] },
        createdAt: new Date().toISOString(),
      },
      {
        id: "m-2",
        channelId: "ch-1",
        senderId: "u-1",
        senderName: "Alice",
        senderEmail: "alice@example.com",
        content: "```ts\nconst ready = true\n```",
        replyToId: "m-1",
        replyPreview: "Welcome to team chat!",
        replySenderName: "Alice",
        edited: false,
        pinned: false,
        reactions: {},
        createdAt: new Date().toISOString(),
      },
      {
        id: "m-sys",
        channelId: "ch-1",
        senderId: "system",
        senderName: "System",
        senderEmail: "system@workspace.local",
        messageType: "SYSTEM",
        content: "👋 Bob Smith (DEVELOPER) joined the project chat",
        replyToId: null,
        replyPreview: null,
        edited: false,
        pinned: false,
        reactions: {},
        createdAt: new Date().toISOString(),
      },
    ],
  } as unknown as ReturnType<typeof chatQueries.useChannelMessagesQuery>)
}

describe("ChatPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it(
    "renders custom shadcn/ui chat, SYSTEM banners, Focus Mode, sidebar collapse, channel info drawer, and pinning",
    () => {
      setupDefaultChannelsAndMessages()
      setupDefaultMutations()
      renderChat()

      expect(screen.getByText("Team Chat")).toBeInTheDocument()
      expect(screen.getAllByText("General Workspace Chat").length).toBeGreaterThan(0)
      expect(screen.getByText("Core API Standup")).toBeInTheDocument()
      expect(screen.getAllByText(/Welcome to team chat!/).length).toBeGreaterThan(0)
      expect(screen.getByText("👋 Bob Smith (DEVELOPER) joined the project chat")).toBeInTheDocument()
      expect(screen.getByText("https://docs.example.com")).toBeInTheDocument()
      expect(screen.getByText("@everyone")).toBeInTheDocument()
      expect(screen.getByText("const ready = true")).toBeInTheDocument()
      expect(screen.getAllByText("Today").length).toBeGreaterThan(0)

      // Focus Mode hides Team Chat page header and toggles cleanly via button, F, and Escape
      fireEvent.click(screen.getByRole("button", { name: "Toggle focus view" }))
      expect(screen.queryByText("Team Chat")).not.toBeInTheDocument()
      fireEvent.keyDown(document, { key: "Escape" })
      expect(screen.getByText("Team Chat")).toBeInTheDocument()

      fireEvent.keyDown(document, { key: "f" })
      expect(screen.queryByText("Team Chat")).not.toBeInTheDocument()
      fireEvent.keyDown(document, { key: "f" })
      expect(screen.getByText("Team Chat")).toBeInTheDocument()

      // Pressing F while typing inside composer must NOT toggle focus mode
      const composer = screen.getByLabelText("Chat message input")
      composer.focus()
      fireEvent.keyDown(composer, { key: "f" })
      expect(screen.getByText("Team Chat")).toBeInTheDocument()

      // Collapse / Expand channel sidebar toggle
      expect(screen.getByLabelText("Conversations sidebar")).not.toHaveClass("hidden")
      fireEvent.click(screen.getByRole("button", { name: "Toggle channel list sidebar" }))
      expect(screen.getByLabelText("Conversations sidebar")).toHaveClass("hidden")
      fireEvent.click(screen.getByRole("button", { name: "Toggle channel list sidebar" }))
      expect(screen.getByLabelText("Conversations sidebar")).not.toHaveClass("hidden")

      // Toggle Right-Side Channel Info Drawer
      fireEvent.click(screen.getByRole("button", { name: "Toggle channel info drawer" }))
      expect(screen.getByLabelText("Channel details drawer")).toBeInTheDocument()
      expect(screen.getByText("Active Participants")).toBeInTheDocument()
      fireEvent.click(screen.getByRole("button", { name: /Shared/i }))
      expect(screen.getByText("Shared Links")).toBeInTheDocument()
      expect(screen.getByText("Code Snippets")).toBeInTheDocument()
      fireEvent.click(screen.getByRole("button", { name: "Close channel info drawer" }))

      // Pin a message and verify the pinned banner appears
      fireEvent.click(screen.getAllByRole("button", { name: "Pin message" })[0])
      expect(screen.getByText(/Pinned \(1\):/)).toBeInTheDocument()
    },
    30000
  )

  it(
    "supports composer quick commands, chat settings, direct message, and group dialogs",
    () => {
      setupDefaultChannelsAndMessages()
      setupDefaultMutations()
      renderChat()

      // Composer quick commands menu
      fireEvent.click(screen.getByRole("button", { name: "Open quick commands" }))
      expect(screen.getByText("/standup")).toBeInTheDocument()
      fireEvent.click(screen.getByText("/standup"))
      expect(
        (screen.getByLabelText("Chat message input") as HTMLTextAreaElement).value
      ).toContain("**Yesterday:**")

      // Chat Settings Dialog
      fireEvent.click(screen.getByRole("button", { name: "Chat settings" }))
      expect(screen.getByRole("heading", { name: "Chat Settings" })).toBeInTheDocument()
      expect(screen.getByText(/Manage in Profile/i)).toBeInTheDocument()
      fireEvent.click(screen.getByRole("button", { name: "Done" }))

      fireEvent.click(screen.getByRole("button", { name: "Direct Message" }))
      expect(screen.getByLabelText("Search teammates for direct chat")).toBeInTheDocument()
      fireEvent.keyDown(document, { key: "Escape" })

      fireEvent.click(screen.getByRole("button", { name: "New Chat Group" }))
      expect(screen.getByLabelText("Group Name")).toBeInTheDocument()
    },
    30000
  )

  it(
    "supports WhatsApp-style older message pagination and file/image attachment uploads",
    async () => {
    const olderIso = "2026-10-01T10:00:00Z"
    const thirtyMessages = Array.from({ length: 30 }, (_, idx) => ({
      id: `m-${idx + 1}`,
      channelId: "ch-proj",
      senderId: "u-1",
      senderName: "Alice",
      senderEmail: "alice@example.com",
      messageType: "USER" as const,
      content: `Batch message #${idx + 1}`,
      attachmentUrl: idx === 0 ? "/api/project-files/pf-1/download" : null,
      attachmentName: idx === 0 ? "architecture.pdf" : null,
      attachmentType: idx === 0 ? "application/pdf" : null,
      attachmentSize: idx === 0 ? 4096 : null,
      replyToId: null,
      replyPreview: null,
      edited: false,
      pinned: false,
      reactions: {},
      createdAt: idx === 0 ? olderIso : new Date().toISOString(),
    }))

    vi.mocked(chatQueries.useChatChannelsQuery).mockReturnValue({
      isLoading: false,
      data: [
        {
          id: "ch-proj",
          name: "Core API Group",
          description: "Project group",
          workspaceId: "ws-1",
          projectId: "p-1",
          projectName: "Core API",
          createdByName: "Alice",
          lastMessageAt: new Date().toISOString(),
          lastMessagePreview: "Batch message #30",
          messageCount: 45,
          createdAt: new Date().toISOString(),
        },
      ],
    } as unknown as ReturnType<typeof chatQueries.useChatChannelsQuery>)

    vi.mocked(chatQueries.useChannelMessagesQuery).mockReturnValue({
      isLoading: false,
      data: thirtyMessages,
    } as unknown as ReturnType<typeof chatQueries.useChannelMessagesQuery>)

    const { uploadMock } = setupDefaultMutations()
    renderChat()

    // WhatsApp-style Load older messages trigger renders when 30+ messages loaded
    const loadOlderBtn = screen.getByRole("button", {
      name: /Load older messages/i,
    })
    fireEvent.click(loadOlderBtn)

    await waitFor(() => {
      expect(chatService.getChannelMessages).toHaveBeenCalledWith("ch-proj", {
        limit: 30,
        before: olderIso,
      })
    })

    // Stage and send a file attachment
    const fileInput = screen.getByLabelText("Upload chat file or image")
    const testFile = new File(["hello"], "design-spec.png", {
      type: "image/png",
    })
    fireEvent.change(fileInput, { target: { files: [testFile] } })

    expect(screen.getByText("design-spec.png")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Send message" }))
    expect(uploadMock.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        file: testFile,
      }),
      expect.any(Object)
    )
  },
  30000
  )
})
