/** Tile a bounded geographic raster or decoded canvas without network requests or scene state. */
export function createRasterTileProvider({
  cesium,
  raster,
  credit,
  createCanvas,
  texture: decodedTexture,
  rectangle = cesium.Rectangle.MAX_VALUE,
  tilingScheme = new cesium.GeographicTilingScheme({ rectangle }),
  maximumLevel = 2,
  tileSize = 256,
}) {
  const texture = decodedTexture ?? createCanvas();
  if (!decodedTexture) {
    texture.width = raster.width;
    texture.height = raster.height;
    const context = texture.getContext('2d');
    const pixels = context.createImageData(raster.width, raster.height);
    pixels.data.set(raster.rgba);
    context.putImageData(pixels, 0, 0);
  }
  return {
    tilingScheme,
    rectangle,
    tileWidth: tileSize,
    tileHeight: tileSize,
    minimumLevel: 0,
    // Cesium 1.138 draping clamps coverage to maximumLevel - 1.
    maximumLevel,
    ready: true,
    tileDiscardPolicy: undefined,
    credit,
    errorEvent: new cesium.Event(),
    hasAlphaChannel: true,
    getTileCredits: () => undefined,
    pickFeatures: () => undefined,
    requestImage(x, y, level) {
      const tile = createCanvas();
      tile.width = tile.height = tileSize;
      const ctx = tile.getContext('2d');
      const width =
        texture.width / tilingScheme.getNumberOfXTilesAtLevel(level);
      const height =
        texture.height / tilingScheme.getNumberOfYTilesAtLevel(level);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(
        texture,
        x * width,
        y * height,
        width,
        height,
        0,
        0,
        tileSize,
        tileSize,
      );
      // ImageryLayer consumes requestImage results as promises.
      return Promise.resolve(tile);
    },
  };
}
