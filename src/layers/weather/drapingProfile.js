const BANDS = Object.freeze([
  Object.freeze({ band: 'low', tileSize: 1024, maximumLevel: 5 }),
  Object.freeze({ band: 'middle', tileSize: 1024, maximumLevel: 4 }),
  Object.freeze({ band: 'high', tileSize: 1024, maximumLevel: 3 }),
]);
const EDGES = [400_000, 1_500_000];

// Cesium 1.138 ImageryPipelineStage truncates draped imagery to 10 texture
// units per primitive. Larger tiles at coarser levels keep four weather layers
// within that budget while retaining detail. Coverage clamps to maximumLevel - 1.
// Evaluate on moveEnd; retain the previous band within 10% of either edge.
export function drapingProfile(height, previousBand) {
  let index = BANDS.findIndex(({ band }) => band === previousBand);
  if (!Number.isFinite(height)) return BANDS[index < 0 ? 0 : index];
  if (index < 0) index = height > EDGES[1] ? 2 : height >= EDGES[0] ? 1 : 0;
  else {
    while (index < 2 && height > EDGES[index] * 1.1) index++;
    while (index > 0 && height < EDGES[index - 1] * 0.9) index--;
  }
  return BANDS[index];
}
