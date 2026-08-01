import type { Metadata } from "next";
import { ItemsClient } from "@/components/domain/inventory/ItemsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Item master — Pravaah",
  description: "One item master serving quotations, sales orders, job cards, project BOQs and purchase orders.",
};

export default async function ItemMasterPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string; q?: string }>;
}) {
  const sp = await searchParams;
  return <ItemsClient initialItemId={sp.item ?? null} initialQuery={sp.q ?? ""} />;
}
