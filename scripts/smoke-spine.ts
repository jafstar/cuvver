// Smoke test for spineCalculator.ts — run with: npx tsx scripts/smoke-spine.ts
// Exits 0 on pass, 1 on any assertion failure.

import { calculateSpine } from '../src/lib/spineCalculator';

let passed = 0;
let failed = 0;

function assert(label: string, actual: number, expected: number, tolerance = 0.0001) {
  const ok = Math.abs(actual - expected) <= tolerance;
  if (ok) {
    console.log(`  ✓  ${label}: ${actual}`);
    passed++;
  } else {
    console.error(`  ✗  ${label}: got ${actual}, expected ${expected}`);
    failed++;
  }
}

function assertThrows(label: string, fn: () => unknown) {
  try {
    fn();
    console.error(`  ✗  ${label}: expected throw, got no error`);
    failed++;
  } catch (e) {
    console.log(`  ✓  ${label}: threw "${(e as Error).message.slice(0, 60)}..."`);
    passed++;
  }
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  spineCalculator smoke test');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// ── Case 1: KDP White 50lb, 350pp, 6×9, 0.125 bleed ─────────────────────────
// spineWidth  = 350 / 434          = 0.8065
// totalWidth  = (6×2) + 0.8065 + (0.125×2) = 13.0565
// totalHeight = 9 + (0.125×2)     = 9.25
console.log('Case 1 — KDP White 50lb, 350pp, 6×9, bleed 0.125');
{
  const r = calculateSpine({ pageCount: 350, vendor: 'KDP', stock: 'White 50lb', width_in: 6, height_in: 9, bleed_in: 0.125 });
  assert('spineWidth_in',  r.spineWidth_in,  0.8065);
  assert('totalWidth_in',  r.totalWidth_in,  13.0565);
  assert('totalHeight_in', r.totalHeight_in, 9.25);
  assert('ppi',            r.ppi,            434);
}

// ── Case 2: KDP Cream 55lb, 100pp, 5×8, 0.125 bleed ─────────────────────────
// spineWidth  = 100 / 400 = 0.25
// totalWidth  = (5×2) + 0.25 + 0.25 = 10.5
// totalHeight = 8 + 0.25 = 8.25
console.log('\nCase 2 — KDP Cream 55lb, 100pp, 5×8, bleed 0.125');
{
  const r = calculateSpine({ pageCount: 100, vendor: 'KDP', stock: 'Cream 55lb', width_in: 5, height_in: 8, bleed_in: 0.125 });
  assert('spineWidth_in',  r.spineWidth_in,  0.25);
  assert('totalWidth_in',  r.totalWidth_in,  10.5);
  assert('totalHeight_in', r.totalHeight_in, 8.25);
  assert('ppi',            r.ppi,            400);
}

// ── Case 3: IngramSpark White 50lb, 500pp, 6×9, 0.125 bleed ─────────────────
// spineWidth  = 500 / 526 = 0.9506
// totalWidth  = 12 + 0.9506 + 0.25 = 13.2006
// totalHeight = 9.25
console.log('\nCase 3 — IngramSpark White 50lb, 500pp, 6×9, bleed 0.125');
{
  const r = calculateSpine({ pageCount: 500, vendor: 'IngramSpark', stock: 'White 50lb', width_in: 6, height_in: 9, bleed_in: 0.125 });
  assert('spineWidth_in',  r.spineWidth_in,  0.9506);
  assert('totalWidth_in',  r.totalWidth_in,  13.2006);
  assert('totalHeight_in', r.totalHeight_in, 9.25);
  assert('ppi',            r.ppi,            526);
}

// ── Case 4: Zero bleed edge case ─────────────────────────────────────────────
console.log('\nCase 4 — Lulu White 50lb, 200pp, 6×9, bleed 0 (no bleed)');
{
  const r = calculateSpine({ pageCount: 200, vendor: 'Lulu', stock: 'White 50lb', width_in: 6, height_in: 9, bleed_in: 0 });
  assert('spineWidth_in',  r.spineWidth_in,  parseFloat((200 / 444).toFixed(4)));
  assert('totalWidth_in',  r.totalWidth_in,  parseFloat((12 + (200 / 444)).toFixed(4)));
  assert('totalHeight_in', r.totalHeight_in, 9);
  assert('ppi',            r.ppi,            444);
}

// ── Case 5: Error — unknown vendor ───────────────────────────────────────────
console.log('\nCase 5 — Error handling');
assertThrows('unknown vendor throws',
  () => calculateSpine({ pageCount: 200, vendor: 'FakePress', stock: 'White 50lb', width_in: 6, height_in: 9, bleed_in: 0.125 })
);
assertThrows('unknown stock throws',
  () => calculateSpine({ pageCount: 200, vendor: 'KDP', stock: 'Newsprint', width_in: 6, height_in: 9, bleed_in: 0.125 })
);
assertThrows('zero pageCount throws',
  () => calculateSpine({ pageCount: 0, vendor: 'KDP', stock: 'White 50lb', width_in: 6, height_in: 9, bleed_in: 0.125 })
);

// ── Result ───────────────────────────────────────────────────────────────────
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  ${passed} passed  ${failed} failed`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
process.exit(failed > 0 ? 1 : 0);
