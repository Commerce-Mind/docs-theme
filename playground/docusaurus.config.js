// Playground for the theme. Uses a fictional "Example" product by default, to show
// how a product that isn't built in passes its own definition.
// Try a built-in product with CM_PRODUCT=nexus or CM_PRODUCT=flux.
const { createConfig } = require('../config');

const example = {
  key: 'example',
  name: 'Example',
  tagline: 'Theme playground for Commerce Mind docs',
  url: 'https://example.commercemind.se',
  colors: {
    graphic: '#F9E238',
    graphicDark: '#F9E238',
    text: '#806A00',
    textDark: '#F9E238',
  },
};

module.exports = createConfig({
  product: process.env.CM_PRODUCT || example,
  repo: 'Commerce-Mind/docs-theme',
  docsDir: 'playground',
  overrides: {
    // The playground is never deployed under a product domain.
    noIndex: true,
  },
});
