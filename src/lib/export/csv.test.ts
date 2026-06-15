import { describe, expect, it } from "vitest";
import { toCsv, type CsvColumn } from "./csv";

interface Row {
  name: string;
  amount: number;
  note: string;
}

const columns: CsvColumn<Row>[] = [
  { header: "Name", value: (r) => r.name },
  { header: "Amount", value: (r) => r.amount },
  { header: "Note", value: (r) => r.note },
];

describe("toCsv", () => {
  it("emits a header row followed by one line per row", () => {
    const csv = toCsv([{ name: "Ada", amount: 100, note: "ok" }], columns);
    expect(csv.split("\n")).toEqual(["Name,Amount,Note", "Ada,100,ok"]);
  });

  it("quotes fields containing commas, quotes, or newlines", () => {
    const csv = toCsv(
      [{ name: "Doe, John", amount: 5, note: 'say "hi"' }],
      columns,
    );
    expect(csv).toContain('"Doe, John"');
    expect(csv).toContain('"say ""hi"""');
  });

  it("renders null/undefined values as empty strings", () => {
    const csv = toCsv(
      [{ name: "", amount: 0, note: undefined as unknown as string }],
      columns,
    );
    expect(csv).toBe("Name,Amount,Note\n,0,");
  });

  it("returns just the header for an empty dataset", () => {
    expect(toCsv([], columns)).toBe("Name,Amount,Note");
  });
});
