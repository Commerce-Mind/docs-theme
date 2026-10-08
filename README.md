# @commercemind/docusaurus-theme

Shared Docusaurus theme and config for Commerce Mind product docs.

## Use in a product repo

```bash
npm install github:Commerce-Mind/docs-theme#v1.0.0
```

```js
// docs/docusaurus.config.js
const { createConfig } = require('@commercemind/docusaurus-theme/config');

module.exports = createConfig({
  product: 'nexus',            // built-in: nexus | flux
  repo: 'Commerce-Mind/Nexus', // enables "Edit this page"
});
```

You get the brand theme, light and dark mode, local search (Cmd+K), Mermaid, the shared footer, `llms.txt`, `llms-full.txt` and a `.md` copy of every page with a "Copy page" menu.

### Other products

A product that isn't built in passes its own definition, so the theme never has to know about it:

```js
module.exports = createConfig({
  product: {
    key: 'example',
    name: 'Example',
    tagline: 'One line about the product',
    url: 'https://example.commercemind.se',
    colors: { graphic: '#…', graphicDark: '#…', text: '#…', textDark: '#…' },
  },
});
```

`text` and `textDark` must reach WCAG AA (4.5:1) against `#FFFFFF` and `#17122E`.

### Titles

Every site uses the same pattern: `<Page> | Commerce Mind <Product>`. Name the start page
`Introduction` in its front matter.

## MDX components

Available in every `.mdx` file without imports: `Card`, `CardGrid`, `Steps`, `Badge`,
`ApiEndpoint`, `Hero`, `Tabs`, `TabItem`. See the playground for examples.

Front matter `hide_page_actions: true` hides the "Copy page" menu on a page.

## Develop

```bash
npm install
npm start                      # playground at http://localhost:3000 (fictional "Example" product)
CM_PRODUCT=nexus npm start     # try a built-in product: nexus | flux
npm run build                  # production build incl. llms.txt
```

Changes to `config.js`, `index.js` or `products.js` need a restart of `npm start`.

## Release

Tag a version (`git tag v1.1.0 && git push --tags`) and bump the tag in each product repo.
