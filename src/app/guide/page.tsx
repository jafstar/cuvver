'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const DPI = 300;
const TOOLS = ['Canva', 'Adobe Photoshop', 'Affinity Publisher'] as const;
type Tool = typeof TOOLS[number];

function inToPx(inches: number) {
  return Math.round(inches * DPI);
}

function GuideContent() {
  const params = useSearchParams();
  const [tool, setTool] = useState<Tool>('Canva');

  const vendor       = params.get('vendor');
  const stock        = params.get('stock');
  const pageCount    = params.get('pageCount');
  const trimLabel    = params.get('trim');
  const ppi          = params.get('ppi');
  const spineWidth   = parseFloat(params.get('spine') ?? '');
  const totalWidth   = parseFloat(params.get('totalWidth') ?? '');
  const totalHeight  = parseFloat(params.get('totalHeight') ?? '');
  const bleed        = 0.125;

  const valid = vendor && stock && Number.isFinite(spineWidth) && Number.isFinite(totalWidth) && Number.isFinite(totalHeight);

  if (!valid) {
    return (
      <main className="min-h-screen bg-[#0d0e11] text-[#9da3ae] font-mono flex items-center justify-center p-4">
        <div className="w-full max-w-xl border border-[#2e3039] bg-[#12141c] rounded-sm p-6 text-center space-y-3">
          <div className="text-[#f4f5f6] text-sm font-bold">No calculation to guide you through yet.</div>
          <p className="text-xs text-[#626875]">Run the spine calculator first — this page builds your setup guide from those numbers.</p>
          <Link href="/calculate" className="inline-block text-xs text-[#3b82f6] hover:underline">→ Go to calculator</Link>
        </div>
      </main>
    );
  }

  const widthPx  = inToPx(totalWidth);
  const heightPx = inToPx(totalHeight);
  const spinePx  = inToPx(spineWidth);
  const bleedPx  = inToPx(bleed);
  const frontStartIn = totalWidth / 2 + spineWidth / 2; // left edge of front cover face

  return (
    <main className="min-h-screen bg-[#0d0e11] text-[#9da3ae] font-mono flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-4">

        {/* Header */}
        <div className="border border-[#2e3039] bg-[#12141c] rounded-sm p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#4ade80]" />
            <span className="text-[#f4f5f6] text-xs font-bold tracking-wider">CUVVER // SETUP GUIDE</span>
          </div>
          <Link href="/calculate" className="text-[#626875] text-xs hover:text-[#9da3ae]">← calculator</Link>
        </div>

        {/* Summary */}
        <div className="border border-[#2e3039] bg-[#12141c] rounded-sm p-4">
          <div className="text-[#626875] text-xs">
            {vendor} · {stock} · {pageCount}pp{trimLabel ? ` · ${trimLabel}` : ''}
          </div>
        </div>

        {/* Tool picker */}
        <div className="border border-[#2e3039] bg-[#12141c] rounded-sm p-5 space-y-3">
          <label className="block text-[#626875] text-xs font-bold uppercase tracking-wider">Your Tool</label>
          <div className="flex flex-wrap gap-2">
            {TOOLS.map(t => (
              <button
                key={t}
                onClick={() => setTool(t)}
                className={`text-xs px-3 py-1.5 border rounded-sm transition-colors ${
                  tool === t
                    ? 'border-[#3b82f6] text-[#3b82f6] bg-[#3b82f6]/10'
                    : 'border-[#2e3039] text-[#626875] hover:border-[#9da3ae]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Canvas setup */}
        <div className="border border-[#2e3039] bg-[#12141c] rounded-sm p-5 space-y-4">
          <div className="text-[#626875] text-xs font-bold uppercase tracking-wider border-b border-[#2e3039] pb-2">
            1. Create Your Canvas
          </div>
          <div className="space-y-3">
            <SpecRow label="Canvas size (inches)" value={`${totalWidth}" × ${totalHeight}"`} />
            <SpecRow label={`Canvas size (px @ ${DPI} DPI)`} value={`${widthPx} × ${heightPx} px`} />
            <SpecRow label="Resolution" value={`${DPI} DPI`} />
          </div>
          {tool === 'Canva' && (
            <p className="text-xs text-[#626875] pt-2 border-t border-[#2e3039]">
              Canva → Create a design → Custom size → enter the pixel dimensions above. Canva works in px, so use the px row.
            </p>
          )}
          {tool === 'Adobe Photoshop' && (
            <p className="text-xs text-[#626875] pt-2 border-t border-[#2e3039]">
              File → New → set Width/Height to the inch values above, Resolution to {DPI}, and set the color mode to CMYK for print.
            </p>
          )}
          {tool === 'Affinity Publisher' && (
            <p className="text-xs text-[#626875] pt-2 border-t border-[#2e3039]">
              File → New → enter the inch dimensions above, DPI {DPI}, and enable &quot;Bleed&quot; in the document setup using the bleed value below.
            </p>
          )}
        </div>

        {/* Guides */}
        <div className="border border-[#2e3039] bg-[#12141c] rounded-sm p-5 space-y-4">
          <div className="text-[#626875] text-xs font-bold uppercase tracking-wider border-b border-[#2e3039] pb-2">
            2. Place Your Guides
          </div>
          <div className="space-y-3">
            <SpecRow label="Bleed (all edges)" value={`${bleed}" / ${bleedPx}px`} />
            <SpecRow label="Spine width" value={`${spineWidth}" / ${spinePx}px`} />
            <SpecRow label="Front cover starts at (from left)" value={`${frontStartIn.toFixed(4)}"`} />
          </div>
          <p className="text-xs text-[#626875] pt-2 border-t border-[#2e3039]">
            Layout left → right: back cover, spine ({spineWidth}&quot; wide, centered), front cover. Keep all text and important
            art at least 0.25&Prime; inside the bleed line — the spine especially, since a small trim shift there is most visible.
          </p>
        </div>

        {/* Export */}
        <div className="border border-[#2e3039] bg-[#12141c] rounded-sm p-5 space-y-3">
          <div className="text-[#626875] text-xs font-bold uppercase tracking-wider border-b border-[#2e3039] pb-2">
            3. Export
          </div>
          <p className="text-xs text-[#626875]">
            Export as a flattened, print-ready PDF at {DPI} DPI. Double-check the exported page size matches{' '}
            <span className="text-[#f4f5f6] font-bold">{totalWidth}&quot; × {totalHeight}&quot;</span> exactly before uploading to {vendor}.
          </p>
          <div className="pt-2 border-t border-[#2e3039] text-xs text-[#626875]">
            PPI source: {ppi} · numbers computed from your calculator inputs, not re-derived here
          </div>
        </div>

      </div>
    </main>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[#626875] text-xs">{label}</span>
      <span className="text-[#4ade80] font-bold text-sm tabular-nums whitespace-nowrap">{value}</span>
    </div>
  );
}

export default function GuidePage() {
  return (
    <Suspense fallback={null}>
      <GuideContent />
    </Suspense>
  );
}
