import { describe, it, expect, vi, beforeEach } from "vitest"
import { fireEvent, screen, waitFor } from "@testing-library/react"
import { ProjectStorageSection } from "./ProjectStorageSection"
import * as storageService from "../services/projectStorage.service"
import { renderWithProviders } from "@/test/testUtils"

vi.mock("../services/projectStorage.service", async (importOriginal) => {
  const actual = await importOriginal<typeof storageService>()
  return {
    ...actual,
    getProjectStorage: vi.fn(),
    uploadProjectFile: vi.fn(),
    deleteProjectFile: vi.fn(),
  }
})

const mockFiles: storageService.ProjectFileItem[] = Array.from(
  { length: 8 },
  (_, index) => ({
    id: `file-${index + 1}`,
    projectId: "proj-1",
    channelId: index % 2 === 1 ? "ch-1" : null,
    uploadedById: "u-1",
    uploadedByName: index % 2 === 1 ? "Bob Chat" : "Alice Owner",
    uploadedByEmail: "user@example.com",
    fileName:
      index % 2 === 1
        ? `chat-diagram-${index + 1}.png`
        : `architecture-doc-${index + 1}.pdf`,
    contentType: index % 2 === 1 ? "image/png" : "application/pdf",
    fileSize: 5 * 1024 * 1024,
    sourceType: index % 2 === 1 ? "CHAT" : "PROJECT",
    downloadUrl: `/api/project-files/file-${index + 1}/download`,
    createdAt: new Date().toISOString(),
  })
)

describe("ProjectStorageSection & Quota Controls", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(storageService.getProjectStorage).mockResolvedValue({
      projectId: "proj-1",
      usedBytes: 40 * 1024 * 1024,
      maxBytes: 50 * 1024 * 1024,
      maxStorageMb: 50,
      files: mockFiles,
    })
  })

  it("displays quota meter, paginates files (6 per page), filters by source/search, and deletes files", async () => {
    vi.mocked(storageService.deleteProjectFile).mockResolvedValueOnce(undefined)

    renderWithProviders(
      <ProjectStorageSection projectId="proj-1" canManage={true} />
    )

    expect(
      await screen.findByText(/40\.00 MB \/ 50\.00 MB \(80%\)/)
    ).toBeInTheDocument()

    // Page 1 shows first 6 files and compact pagination
    expect(screen.getByText("architecture-doc-1.pdf")).toBeInTheDocument()
    expect(screen.queryByText("architecture-doc-7.pdf")).not.toBeInTheDocument()
    expect(screen.getByText(/Showing/i)).toBeInTheDocument()
    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument()

    // Navigate to Page 2
    fireEvent.click(screen.getByRole("button", { name: /Next/i }))
    expect(screen.getByText("architecture-doc-7.pdf")).toBeInTheDocument()
    expect(screen.getByText("chat-diagram-8.png")).toBeInTheDocument()

    // Filter by "From Chat" source
    fireEvent.click(screen.getByRole("button", { name: "From Chat" }))
    expect(screen.getByText("chat-diagram-2.png")).toBeInTheDocument()
    expect(screen.queryByText("architecture-doc-1.pdf")).not.toBeInTheDocument()

    // Search within files
    fireEvent.change(screen.getByLabelText("Search project files"), {
      target: { value: "diagram-8" },
    })
    expect(screen.getByText("chat-diagram-8.png")).toBeInTheDocument()
    expect(screen.queryByText("chat-diagram-2.png")).not.toBeInTheDocument()

    // Delete file
    fireEvent.click(
      screen.getByRole("button", { name: "Delete chat-diagram-8.png" })
    )
    await waitFor(() => {
      expect(storageService.deleteProjectFile).toHaveBeenCalledWith("file-8")
    })
  })

  it("disables upload when quota is full and hides delete actions when canManage is false", async () => {
    vi.mocked(storageService.getProjectStorage).mockResolvedValueOnce({
      projectId: "proj-1",
      usedBytes: 50 * 1024 * 1024,
      maxBytes: 50 * 1024 * 1024,
      maxStorageMb: 50,
      files: [mockFiles[0]],
    })

    renderWithProviders(
      <ProjectStorageSection projectId="proj-1" canManage={false} />
    )

    expect(
      await screen.findByText(/50\.00 MB \/ 50\.00 MB \(100%\)/)
    ).toBeInTheDocument()

    expect(screen.getByRole("button", { name: /Upload File/i })).toBeDisabled()
    expect(
      screen.queryByRole("button", { name: /Delete architecture-doc-1\.pdf/i })
    ).not.toBeInTheDocument()
  })

  it("formats byte sizes and resolves backend file URLs safely", () => {
    expect(storageService.formatBytes(0)).toBe("0 B")
    expect(storageService.formatBytes(512)).toBe("512 B")
    expect(storageService.formatBytes(2048)).toBe("2.0 KB")
    expect(storageService.formatBytes(5 * 1024 * 1024)).toBe("5.00 MB")

    expect(storageService.resolveBackendFileUrl("https://cdn.test/a.png")).toBe(
      "https://cdn.test/a.png"
    )
    expect(
      storageService.resolveBackendFileUrl("/api/project-files/f1/download")
    ).toContain("/project-files/f1/download")
  })
})
