/** MEGA TOOLS style reminder — the cobalt double-square is a clear utility signal, never a decorative flourish. */
import { Link } from "wouter";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="brand-mark" aria-label="MEGA TOOLS home">
      <img src="/manus-storage/mega-tools-mark_64b2ebe8.png" alt="" className="brand-icon" />
      {!compact && (
        <span className="brand-wordmark">
          <strong>MEGA</strong><em>TOOLS</em><small>UTILITY<br />LEDGER</small>
        </span>
      )}
    </Link>
  );
}
