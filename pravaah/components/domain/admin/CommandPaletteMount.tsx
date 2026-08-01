"use client";

/**
 * E1-S5 mount point.
 *
 * `Shell.tsx` is frozen for this wave, so the palette is mounted here and
 * rendered from the Admin layout instead. The header's Search control can be
 * pointed at it later with a one-line change — it only needs to dispatch
 * `PALETTE_EVENT` on `window`. Nothing else about the palette changes when it
 * moves into the shell.
 */

import { CommandPalette, PALETTE_EVENT, type PaletteRecord } from "@/components/patterns/CommandPalette";

export function CommandPaletteMount({
  records,
  note,
}: {
  records: PaletteRecord[];
  note: string;
}) {
  return <CommandPalette records={records} indexNote={note} />;
}

/** Opens the palette from any client control. */
export function openCommandPalette(): void {
  window.dispatchEvent(new Event(PALETTE_EVENT));
}

export function CommandPaletteButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openCommandPalette}
      className={
        className ??
        "t-body-sm inline-flex h-8 items-center gap-2 rounded-md border border-line bg-surface-2 px-2.5 text-text-mid hover:border-line-strong hover:text-text-hi"
      }
    >
      Search anything
      <kbd className="t-mono rounded border border-line px-1 text-[0.6875rem] text-text-lo">
        Ctrl K
      </kbd>
    </button>
  );
}
