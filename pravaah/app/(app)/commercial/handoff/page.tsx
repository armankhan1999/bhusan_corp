import type { Metadata } from "next";
import {
  buildChallanRows, buildInvoiceRows, buildNoteRows, buildReceiptRows, buildSeries, ctx, readActor,
} from "@/components/domain/commercial/data";
import { HandoffClient, type HandoffDoc } from "./HandoffClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ledger hand-off — Pravaah",
  description: "Period export of invoices, receipts, challans and notes for the accounting package, which remains the statutory book of record.",
};

export default async function HandoffPage() {
  const { ds, now, todayIso } = ctx();
  const actor = await readActor("handoff");

  // Flattened to the few fields the hand-off needs, so a period spanning a
  // financial year does not carry four full registers to the browser.
  const docs: HandoffDoc[] = [
    ...buildInvoiceRows(ds, now).map((i) => ({
      kind: "INVOICE" as const, id: i.id, number: i.number, date: i.date,
      value: i.total + i.roundOff, party: i.customerName, gstin: i.customerGstin, simulated: false,
    })),
    ...buildReceiptRows(ds).map((r) => ({
      kind: "RECEIPT" as const, id: r.id, number: r.number, date: r.date,
      value: r.amount, party: r.customerName, gstin: null, simulated: false,
    })),
    ...buildChallanRows(ds, now).map((c) => ({
      kind: "CHALLAN" as const, id: c.id, number: c.number, date: c.date,
      value: c.consignmentValue, party: c.customerName, gstin: c.customerGstin, simulated: false,
    })),
    ...buildNoteRows(ds).map((n) => ({
      kind: "NOTE" as const, id: n.id, number: n.number, date: n.date,
      value: n.amount + n.gstAmount, party: n.customerName, gstin: null, simulated: false,
    })),
  ];

  return (
    <HandoffClient
      docs={docs}
      series={buildSeries(ds)}
      actor={actor}
      todayIso={todayIso}
    />
  );
}
