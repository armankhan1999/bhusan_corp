import { getDataset } from "@/lib/seed";
import { buildPaletteIndex } from "@/components/domain/admin/paletteIndex";
import { CommandPaletteMount } from "@/components/domain/admin/CommandPaletteMount";
import { requireSession } from "@/components/domain/admin/serverSession";

/**
 * The Admin section mounts the global command palette (E1-S5). `Shell.tsx` is
 * frozen for this wave, so the palette lives here until the header's Search
 * control is pointed at it — see CommandPaletteMount for the one-line wiring.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const ds = getDataset();
  const user = ds.users.find((u) => u.id === session.userId) ?? null;
  const index = buildPaletteIndex(ds, {
    userId: session.userId,
    role: session.role,
    branchId: session.branchId,
    employeeId: user?.employeeId ?? null,
  });

  return (
    <>
      <CommandPaletteMount records={index.records} note={index.note} />
      {children}
    </>
  );
}
