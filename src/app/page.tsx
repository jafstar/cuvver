import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

interface PPIMetric {
  vendor: string;
  stock: string;
  ppi: number;
}

interface PPIRegistry {
  version: string;
  metrics: PPIMetric[];
}

export default function Page() {
  const registryPath = path.join(process.cwd(), 'src/data/ppi-registry.v1.json');

  // Intentionally no try/catch — missing or malformed registry kills the build.
  // Checkpoint 3: fail hard at static compile time, never serve stale data.
  const parsedData = JSON.parse(fs.readFileSync(registryPath, 'utf8')) as PPIRegistry;
  const registryData: PPIMetric[] = parsedData.metrics;
  const registryVersion: string = parsedData.version ?? 'v1.0.0';

  if (!Array.isArray(registryData) || registryData.length === 0) {
    throw new Error(`REGISTRY_INTEGRITY_FAILURE: ${registryPath} contains no valid metrics.`);
  }

  return (
    <main className="min-h-screen bg-[#0d0e11] text-[#9da3ae] font-mono flex items-center justify-center p-4">
      <div className="w-full max-w-xl border border-[#2e3039] bg-[#12141c] rounded-sm p-6 shadow-2xl space-y-6">

        <div className="flex items-center justify-between border-b border-[#2e3039] pb-4">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#4ade80]" />
            <span className="text-[#f4f5f6] text-xs font-bold tracking-wider">CUVVER.APP // PRINT_LAYOUT</span>
          </div>
          <span className="text-[#626875] text-xs">REGISTRY: {registryVersion}</span>
        </div>

        <div className="space-y-3">
          <h1 className="text-[#f4f5f6] text-xl font-bold tracking-tight leading-snug">
            Your cover was rejected.<br />
            The spine was off.
          </h1>
          <p className="text-sm leading-relaxed">
            KDP, IngramSpark, and Lulu each calculate spine width differently.
            Get the exact dimensions for your page count, paper type, and trim size — before you upload.
          </p>
        </div>

        <a
          href="/calculate"
          className="block w-full text-center bg-[#4ade80] text-[#0d0e11] font-bold text-sm py-3 px-4 rounded-sm hover:bg-[#86efac] transition-colors tracking-wider"
        >
          → CALCULATE MY COVER DIMENSIONS
        </a>

        <div className="grid grid-cols-2 gap-4 border-t border-[#2e3039] pt-4 text-xs">
          <div>
            <span className="block text-[#626875] font-bold uppercase tracking-wider mb-1">Platforms</span>
            <span className="text-[#f4f5f6] font-medium">KDP · IngramSpark · Lulu</span>
          </div>
          <div>
            <span className="block text-[#626875] font-bold uppercase tracking-wider mb-1">PPI Records</span>
            <span className="text-[#f4f5f6] font-medium">{registryData.length} Verified Specs</span>
          </div>
        </div>

        <div className="border-t border-[#2e3039] pt-4 text-xs flex items-center justify-between">
          <a href="https://github.com/jafstar/cuvver" className="text-[#3b82f6] hover:underline" target="_blank" rel="noopener noreferrer">
            → View on GitHub
          </a>
          <a href="https://aint.farm" className="text-[#626875] hover:text-[#9da3ae]" target="_blank" rel="noopener noreferrer">
            Powered by AInt.farm
          </a>
        </div>

      </div>
    </main>
  );
}
