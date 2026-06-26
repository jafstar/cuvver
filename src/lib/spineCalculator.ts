import registryJson from '../data/ppi-registry.v1.json';

interface PPIMetric   { vendor: string; stock: string; ppi: number; }
interface PPIRegistry { version: string; metrics: PPIMetric[]; }

const registry = registryJson as PPIRegistry;

export interface SpineInput {
  pageCount: number;
  vendor: string;
  stock: string;    // must match registry field exactly, e.g. "White 50lb"
  width_in: number; // trim width of one cover face
  height_in: number;
  bleed_in: number; // bleed on each edge, typically 0.125
}

export interface SpineOutput {
  spineWidth_in: number;
  totalWidth_in: number;  // back + spine + front + (bleed × 2)
  totalHeight_in: number; // height + (bleed × 2)
  ppi: number;            // PPI value used — include in any audit trail
}

export function calculateSpine(input: SpineInput): SpineOutput {
  const { pageCount, vendor, stock, width_in, height_in, bleed_in } = input;

  if (pageCount < 1)          throw new Error(`pageCount must be >= 1, got ${pageCount}`);
  if (width_in  <= 0)         throw new Error(`width_in must be positive, got ${width_in}`);
  if (height_in <= 0)         throw new Error(`height_in must be positive, got ${height_in}`);
  if (bleed_in  <  0)         throw new Error(`bleed_in must be >= 0, got ${bleed_in}`);

  const record = registry.metrics.find(m => m.vendor === vendor && m.stock === stock);
  if (!record) {
    const available = registry.metrics.map(m => `"${m.vendor}/${m.stock}"`).join(', ');
    throw new Error(
      `No PPI record for vendor="${vendor}" stock="${stock}". Available: ${available}`
    );
  }

  const spineWidth_in  = parseFloat((pageCount / record.ppi).toFixed(4));
  const totalWidth_in  = parseFloat(((width_in * 2) + spineWidth_in + (bleed_in * 2)).toFixed(4));
  const totalHeight_in = parseFloat((height_in + (bleed_in * 2)).toFixed(4));

  return { spineWidth_in, totalWidth_in, totalHeight_in, ppi: record.ppi };
}
