class AssetPrefixPlugin {
  constructor(options = {}) {
    this.assetPrefix = options.assetPrefix || '';
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('AssetPrefixPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'AssetPrefixPlugin',
          stage: compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
        },
        (assets) => {
          Object.keys(assets).forEach((filename) => {
            if (filename.endsWith('.css')) {
              const asset = assets[filename];
              let source = asset.source();

              // Transform background-image URLs that start with /
              // Automatically prepend /public to relative URLs
              source = source.replace(/url\(['"]?(\/[^'"]*?)['"]?\)/g, (match, path) => {
                // If the path doesn't already start with /public, add it
                const publicPath = path.startsWith('/public') ? path : `/public${path}`;

                return `url(${this.assetPrefix}${publicPath})`;
              });

              assets[filename] = {
                ...asset,
                source: () => source,
              };
            }
          });
        },
      );
    });
  }
}

module.exports = AssetPrefixPlugin;
