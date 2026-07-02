'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { calculateSpine, type SpineOutput } from '@/lib/spineCalculator';
import registryJson from '@/data/ppi-registry.v1.json';

interface PPIMetric { vendor: string; stock: string; ppi: number; }
const registry = (registryJson as { metrics: PPIMetric[] }).metrics;

const TRIM_PRESETS = [
  { label: '6" × 9"',      width: 6,   height: 9    },
  { label: '5.5" × 8.5"',  width: 5.5, height: 8.5  },
  { label: '5" × 8"',      width: 5,   height: 8    },
  { label: '5.25" × 8"',   width: 5.25,height: 8    },
  { label: '8.5" × 11"',   width: 8.5, height: 11   },
];

const BLEED = 0.125;

export default function CalculatePage() {
  const vendors = useMemo(() => [...new Set(registry.map(m => m.vendor))], []);

  const [vendor,    setVendor]    = useState(vendors[0] ?? '');
  const [stock,     setStock]     = useState('');
  const [pageCount, setPageCount] = useState(300);
  const [trimIdx,   setTrimIdx]   = useState(0);

  const stocks = useMemo(
    () => registry.filter(m => m.vendor === vendor).map(m => m.stock),
    [vendor]
  );

  // Reset stock when vendor changes
  const handleVendor = (v: string) => { setVendor(v); setStock(''); };

  const activeStock = stock || stocks[0] || '';
  const trim        = TRIM_PRESETS[trimIdx];

  const result: SpineOutput | null = useMemo(() => {
    if (!vendor || !activeStock || !trim || pageCount < 1) return null;
    try {
      return calculateSpine({
        pageCount,
        vendor,
        stock: activeStock,
        width_in:  trim.width,
        height_in: trim.height,
        bleed_in:  BLEED,
      });
    } catch { return null; }
  }, [vendor, activeStock, pageCount, trim]);

  return (
    <main className="min-h-screen bg-[#0d0e11] text-[#9da3ae] font-mono flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-4">

        {/* Header */}
        <div className="border border-[#2e3039] bg-[#12141c] rounded-sm p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#4ade80]" />
            <span className="text-[#f4f5f6] text-xs font-bold tracking-wider">CUVVER // SPINE CALCULATOR</span>
          </div>
          <Link href="/" className="text-[#626875] text-xs hover:text-[#9da3ae]">← home</Link>
        </div>

        {/* Inputs */}
        <div className="border border-[#2e3039] bg-[#12141c] rounded-sm p-5 space-y-4">

          {/* Vendor */}
          <div className="space-y-1">
            <label className="block text-[#626875] text-xs font-bold uppercase tracking-wider">Vendor</label>
            <select
              value={vendor}
              onChange={e => handleVendor(e.target.value)}
              className="w-full bg-[#0d0e11] border border-[#2e3039] text-[#f4f5f6] text-sm px-3 py-2 rounded-sm focus:outline-none focus:border-[#3b82f6]"
            >
              {vendors.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {/* Paper Stock */}
          <div className="space-y-1">
            <label className="block text-[#626875] text-xs font-bold uppercase tracking-wider">Paper Stock</label>
            <select
              value={activeStock}
              onChange={e => setStock(e.target.value)}
              className="w-full bg-[#0d0e11] border border-[#2e3039] text-[#f4f5f6] text-sm px-3 py-2 rounded-sm focus:outline-none focus:border-[#3b82f6]"
            >
              {stocks.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* Page Count */}
          <div className="space-y-1">
            <label className="block text-[#626875] text-xs font-bold uppercase tracking-wider">
              Page Count
              <span className="ml-2 text-[#f4f5f6] font-normal normal-case">{pageCount}</span>
            </label>
            <input
              type="range"
              min={24}
              max={800}
              value={pageCount}
              onChange={e => setPageCount(Number(e.target.value))}
              className="w-full accent-[#3b82f6]"
            />
            <div className="flex justify-between text-[#626875] text-xs">
              <span>24</span><span>800</span>
            </div>
          </div>

          {/* Trim Size */}
          <div className="space-y-1">
            <label className="block text-[#626875] text-xs font-bold uppercase tracking-wider">Trim Size</label>
            <div className="flex flex-wrap gap-2">
              {TRIM_PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => setTrimIdx(i)}
                  className={`text-xs px-3 py-1.5 border rounded-sm transition-colors ${
                    trimIdx === i
                      ? 'border-[#3b82f6] text-[#3b82f6] bg-[#3b82f6]/10'
                      : 'border-[#2e3039] text-[#626875] hover:border-[#9da3ae]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bleed note */}
          <p className="text-[#626875] text-xs">Bleed: 0.125&Prime; per edge (print industry standard)</p>
        </div>

        {/* Output */}
        {result ? (
          <div className="border border-[#2e3039] bg-[#12141c] rounded-sm p-5 space-y-4">
            <div className="text-[#626875] text-xs font-bold uppercase tracking-wider border-b border-[#2e3039] pb-2">
              Layout Blueprint — {vendor} · {activeStock} · {pageCount}pp · {trim.label}
            </div>

            <div className="space-y-3">
              {[
                { label: 'Spine Width',       value: result.spineWidth_in,  note: 'design your spine graphic to this exact width' },
                { label: 'Total Flat Width',   value: result.totalWidth_in,  note: 'full PDF width: back + spine + front + bleed' },
                { label: 'Total Flat Height',  value: result.totalHeight_in, note: 'full PDF height including bleed' },
              ].map(row => (
                <div key={row.label} className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[#f4f5f6] text-sm font-bold">{row.label}</span>
                    <span className="block text-[#626875] text-xs mt-0.5">{row.note}</span>
                  </div>
                  <span className="text-[#4ade80] font-bold text-lg tabular-nums whitespace-nowrap">
                    {row.value.toFixed(4)}&Prime;
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#2e3039] pt-3 text-xs text-[#626875]">
              PPI source: {result.ppi} · registry v{(registryJson as { version: string }).version}
            </div>

            <Link
              href={{
                pathname: '/guide',
                query: {
                  vendor,
                  stock: activeStock,
                  pageCount: String(pageCount),
                  trim: trim.label,
                  ppi: String(result.ppi),
                  spine: String(result.spineWidth_in),
                  totalWidth: String(result.totalWidth_in),
                  totalHeight: String(result.totalHeight_in),
                },
              }}
              className="block text-center text-xs font-bold px-3 py-2.5 border border-[#3b82f6] text-[#3b82f6] bg-[#3b82f6]/10 rounded-sm hover:bg-[#3b82f6]/20 transition-colors"
            >
              Get Setup Guide →
            </Link>
          </div>
        ) : (
          <div className="border border-[#2e3039] bg-[#12141c] rounded-sm p-5 text-[#626875] text-sm">
            Select vendor and stock to calculate dimensions.
          </div>
        )}

      </div>
    </main>
  );
}
