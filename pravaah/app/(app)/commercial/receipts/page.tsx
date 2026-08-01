import type { Metadata } from "next";
import {
  buildBranchRefs, buildInvoiceRows, buildReceiptRows, buildSeries, ctx, readActor,
} from "@/components/domain/commercial/data";
import { ReceiptsClient } from "./ReceiptsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Receipts — Pravaah",
  description: "Receipts with invoice-level allocation, visible unallocated balances and a simulated UPI collection link.",
};

export default async function ReceiptsPage() {
  const { ds, now, todayIso } = ctx();
  const actor = await readActor("receipts");

  return (
    <ReceiptsClient
      receipts={buildReceiptRows(ds)}
      invoices={buildInvoiceRows(ds, now)}
      branches={buildBranchRefs(ds)}
      series={buildSeries(ds).find((s) => s.docType === "RECEIPT") ?? null}
      seededReceiptCount={ds.receipts.length}
      actor={actor}
      todayIso={todayIso}
    />
  );
}
