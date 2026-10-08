// Built-in product definitions. Colors are Commerce Mind logo colors, each with a
// text-safe variant (WCAG AA >= 4.5:1) for links and buttons.
//   graphic     - logo color: navbar bar, icons, illustrations (light mode)
//   graphicDark - same, dark mode
//   text        - links/buttons in light mode (on white)
//   textDark    - links/buttons in dark mode (on #17122E)
//
// A product that isn't listed here can pass its own definition with the same
// shape to createConfig({ product: { key, name, tagline, url, colors } }).
const products = {
  nexus: {
    key: 'nexus',
    name: 'Nexus',
    tagline: 'Background jobs and queues for .NET',
    url: 'https://nexus.commercemind.se',
    colors: {
      graphic: '#23184C',
      graphicDark: '#A99BF0',
      text: '#6B4FD0',
      textDark: '#A99BF0',
    },
  },
  flux: {
    key: 'flux',
    name: 'Flux',
    tagline: 'Documentation for Flux',
    url: 'https://flux.commercemind.se',
    colors: {
      graphic: '#36E8BA',
      graphicDark: '#36E8BA',
      text: '#0B7A5A',
      textDark: '#36E8BA',
    },
  },
};

const COLOR_KEYS = ['graphic', 'graphicDark', 'text', 'textDark'];

/** Accepts a built-in key ("nexus") or a full product definition object. */
function resolveProduct(product) {
  const p = typeof product === 'string' ? products[product] : product;
  if (!p) {
    throw new Error(
      `@commercemind/docusaurus-theme: unknown product "${product}". ` +
        `Use one of: ${Object.keys(products).join(', ')}, or pass a product definition.`,
    );
  }
  const missing = ['key', 'name', 'url'].filter((k) => !p[k]);
  const missingColors = COLOR_KEYS.filter((k) => !p.colors?.[k]);
  if (missing.length || missingColors.length) {
    throw new Error(
      `@commercemind/docusaurus-theme: product definition is missing ` +
        [...missing, ...missingColors.map((k) => `colors.${k}`)].join(', '),
    );
  }
  return p;
}

module.exports = { products, resolveProduct };
