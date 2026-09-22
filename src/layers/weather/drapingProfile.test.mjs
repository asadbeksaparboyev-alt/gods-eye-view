import test from 'node:test';
import assert from 'node:assert/strict';
import { drapingProfile } from './drapingProfile.js';

test('draping bands retain near-ground resolution and coarsen above 400 km and 1.5 Mm', () => {
  for (const [height, band, maximumLevel] of [
    [60_000, 'low', 5],
    [399_999, 'low', 5],
    [400_000, 'middle', 4],
    [1_500_000, 'middle', 4],
    [1_500_001, 'high', 3],
    [20_000_000, 'high', 3],
  ])
    assert.deepEqual(drapingProfile(height), {
      band,
      tileSize: 1024,
      maximumLevel,
    });
});

test('ten percent hysteresis works in both directions, including multi-band jumps', () => {
  for (const [height, previous, expected] of [
    [440_000, 'low', 'low'],
    [440_001, 'low', 'middle'],
    [360_000, 'middle', 'middle'],
    [359_999, 'middle', 'low'],
    [1_650_000, 'middle', 'middle'],
    [1_650_001, 'middle', 'high'],
    [1_350_000, 'high', 'high'],
    [1_349_999, 'high', 'middle'],
    [2_000_000, 'low', 'high'],
    [60_000, 'high', 'low'],
    [NaN, 'high', 'high'],
    [undefined, undefined, 'low'],
  ])
    assert.equal(drapingProfile(height, previous).band, expected);
  let previous = 'low';
  for (const height of [401_000, 399_000, 420_000, 390_000]) {
    previous = drapingProfile(height, previous).band;
    assert.equal(previous, 'low');
  }
});
