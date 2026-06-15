import { NextResponse } from "next/server";
import { format } from "date-fns";
import { filterTransactions } from "@/lib/mock/data";
import { queryCases } from "@/lib/mock/cases";
import { queryCustomers } from "@/lib/mock/customers";
import { toCsv } from "@/lib/export/csv";
import {
  caseColumns,
  customerColumns,
  transactionColumns,
} from "@/lib/export/datasets";
import { sleep } from "@/lib/utils";
import type {
  CaseStatus,
  KycStatus,
  RiskLevel,
  TransactionStatus,
} from "@/lib/types";

function csvResponse(name: string, csv: string) {
  const filename = `${name}-${format(new Date(), "yyyy-MM-dd")}.csv`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ dataset: string }> },
) {
  await sleep(300);
  const { dataset } = await params;
  const sp = new URL(request.url).searchParams;

  switch (dataset) {
    case "transactions": {
      const rows = filterTransactions({
        search: sp.get("search") ?? "",
        status: (sp.get("status") as TransactionStatus | "all" | null) ?? "all",
        risk: (sp.get("risk") as RiskLevel | "all" | null) ?? "all",
      });
      return csvResponse("transactions", toCsv(rows, transactionColumns));
    }
    case "alerts": {
      const rows = queryCases({
        search: sp.get("search") ?? "",
        status: (sp.get("status") as CaseStatus | "all" | null) ?? "all",
        priority: (sp.get("priority") as RiskLevel | "all" | null) ?? "all",
      });
      return csvResponse("cases", toCsv(rows, caseColumns));
    }
    case "customers": {
      const rows = queryCustomers({
        search: sp.get("search") ?? "",
        kyc: (sp.get("kyc") as KycStatus | "all" | null) ?? "all",
        risk: (sp.get("risk") as RiskLevel | "all" | null) ?? "all",
      });
      return csvResponse("customers", toCsv(rows, customerColumns));
    }
    default:
      return NextResponse.json({ error: "Unknown dataset" }, { status: 404 });
  }
}
