export interface CsvColumn<T> {
  header: string
  accessor: (row: T) => unknown
}

const FORMULA_TRIGGER_RE = /^[=+\-@\t\r]/

/**
 * Escapes a single CSV cell value per RFC 4180 while neutralizing spreadsheet
 * formula injection (=, +, -, @, tab, CR) by prefixing an apostrophe.
 */
export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return ""
  }

  let str: string
  if (value instanceof Date) {
    str = Number.isNaN(value.getTime()) ? "" : value.toISOString()
  } else {
    str = String(value)
  }

  let neutralized = false
  if (FORMULA_TRIGGER_RE.test(str)) {
    str = `'${str}`
    neutralized = true
  }

  if (neutralized || /[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }

  return str
}

/**
 * Builds a UTF-8 BOM-prefixed CSV string with CRLF line endings.
 */
export function buildCsvString<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const headerRow = columns.map((col) => escapeCsvCell(col.header)).join(",")
  const dataRows = rows.map((row) =>
    columns.map((col) => escapeCsvCell(col.accessor(row))).join(",")
  )

  return `\uFEFF${[headerRow, ...dataRows].join("\r\n")}`
}

/**
 * Generates a CSV file and triggers a browser download.
 */
export function downloadCsv<T>(
  filename: string,
  rows: T[],
  columns: CsvColumn<T>[]
): void {
  const csv = buildCsvString(rows, columns)
  const resolvedName = filename.toLowerCase().endsWith(".csv")
    ? filename
    : `${filename}.csv`

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", resolvedName)
  link.style.display = "none"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}
