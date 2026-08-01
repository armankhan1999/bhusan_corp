import type { Metadata } from "next";
import {
  buildBranchRefs, buildFollowUpRows, buildInvoiceRows, buildUserRefs, ctx, readActor,
} from "@/components/domain/commercial/data";
import { ReceivablesClient } from "./ReceivablesClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Receivables — Pravaah",
  description: "Receivables aged 0–30 / 31–60 / 61–90 / 90+, institutional against private exposure, broken promises and escalations.",
};

export default async function ReceivablesPage() {
  const { ds, now, todayIso } = ctx();
  const actor = await readActor("receivables");

  const rows = buildInvoiceRows(ds, now);
  const executiveIds = new Set(rows.map((r) => r.accountExecutiveId));

  return (
    <ReceivablesClient
      rows={rows}
      followUps={buildFollowUpRows(ds)}
      branches={buildBranchRefs(ds)}
      executives={buildUserRefs(ds, executiveIds)}
      actor={actor}
      todayIso={todayIso}
    />
  );
}
