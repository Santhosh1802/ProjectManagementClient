import { describe, it, expect, vi, afterEach } from "vitest"
import { buildCsvString, downloadCsv, escapeCsvCell, type CsvColumn } from "@/lib/csvExport"

describe("csvExport utilities", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("handles null, undefined, Date, and RFC 4180 comma/quote/newline escaping", () => {
    expect(escapeCsvCell(null)).toBe("")
    expect(escapeCsvCell(undefined)).toBe("")
    expect(escapeCsvCell("plain")).toBe("plain")
    expect(escapeCsvCell("hello, world")).toBe('"hello, world"')
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""')
    expect(escapeCsvCell("line1\nline2")).toBe('"line1\nline2"')

    const d = new Date("2026-11-19T12:00:00.000Z")
    expect(escapeCsvCell(d)).toBe("2026-11-19T12:00:00.000Z")
  })

  it("neutralizes spreadsheet formula injection prefixes", () => {
    expect(escapeCsvCell("=SUM(A1:A5)")).toBe("\"'=SUM(A1:A5)\"")
    expect(escapeCsvCell("+cmd|' /C calc'!A0")).toBe("\"'+cmd|' /C calc'!A0\"")
    expect(escapeCsvCell("-1+1")).toBe("\"'-1+1\"")
    expect(escapeCsvCell("@evil")).toBe("\"'@evil\"")
    expect(escapeCsvCell("\tindented")).toBe("\"'\tindented\"")
    expect(escapeCsvCell("\rcarriage")).toBe("\"'\rcarriage\"")
  })

  it("builds a UTF-8 BOM prefixed CSV string with CRLF line endings", () => {
    interface SampleRow {
      title: string
      count: number
      note: string | null
    }

    const columns: CsvColumn<SampleRow>[] = [
      { header: "Title", accessor: (r) => r.title },
      { header: "Count", accessor: (r) => r.count },
      { header: "Note", accessor: (r) => r.note },
    ]

    const csv = buildCsvString(
      [
        { title: 'Task "Alpha", v1', count: 3, note: null },
        { title: "=HYPERLINK()", count: 1, note: "ok" },
      ],
      columns
    )

    expect(csv.startsWith("\uFEFF")).toBe(true)
    const lines = csv.slice(1).split("\r\n")
    expect(lines).toEqual([
      "Title,Count,Note",
      '"Task ""Alpha"", v1",3,',
      '"\'=HYPERLINK()",1,ok',
    ])
  })

  it("triggers an anchor click and revokes the object URL when downloading", () => {
    const createObjectURL = vi.fn(() => "blob:mock-csv-url")
    const revokeObjectURL = vi.fn()
    Object.defineProperty(URL, "createObjectURL", {
      value: createObjectURL,
      configurable: true,
      writable: true,
    })
    Object.defineProperty(URL, "revokeObjectURL", {
      value: revokeObjectURL,
      configurable: true,
      writable: true,
    })

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {})

    downloadCsv(
      "tasks-report",
      [{ name: "Build Calendar" }],
      [{ header: "Name", accessor: (r) => r.name }]
    )

    expect(createObjectURL).toHaveBeenCalledTimes(1)
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:mock-csv-url")
  })
})
