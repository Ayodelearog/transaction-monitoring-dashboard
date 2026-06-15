export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | null | undefined;
}

/** Escape a single CSV field per RFC 4180 (quote if it contains , " or newline). */
function escapeField(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Serialize rows to a CSV string given typed column definitions. */
export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => escapeField(c.header)).join(",");
  const body = rows.map((row) =>
    columns.map((c) => escapeField(c.value(row))).join(","),
  );
  return [header, ...body].join("\n");
}
