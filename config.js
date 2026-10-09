const path = require('path');
const { themes: prismThemes } = require('prism-react-renderer');
const { products, resolveProduct } = require('./products');
const { withContrast } = require('./prism-contrast');

/**
 * Build a complete Docusaurus config for a Commerce Mind product.
 *
 *   module.exports = createConfig({ product: 'nexus', repo: 'Commerce-Mind/Nexus' });
 *
 * Each product site stands on its own: no links to other products.
 * Browser titles follow one pattern on every site: "<Page> | Commerce Mind <Product>".
 *
 * @param {object}   opts
 * @param {string|object} opts.product  Built-in key ('nexus' | 'flux') or a product definition
 *                                      (see products.js for the shape)
 * @param {string}   [opts.repo]        GitHub repo ("Owner/Name"), enables "Edit this page"
 * @param {string}   [opts.docsDir]     Path to the docs site inside the repo (default "docs")
 * @param {string}   [opts.url]         Site URL (default: the product's subdomain)
 * @param {object[]} [opts.navbarItems] Extra navbar items, placed before search
 * @param {boolean}  [opts.hideFromSearchEngines] Send "X-Robots-Tag: noindex" (via _headers) until launch.
 *                                      Don't use siteConfig.noIndex: it also empties the site search.
 * @param {object}   [opts.apiReference] Generated API reference from an OpenAPI document:
 *                                      { specPath, routeBasePath = 'api/reference', outputDir = 'api-reference' }.
 *                                      Lives in its own docs instance, so the OpenAPI theme's
 *                                      JavaScript only loads on API pages.
 * @param {object}   [opts.docs]        Extra options for the docs plugin
 * @param {Array}    [opts.plugins]     Extra Docusaurus plugins
 * @param {Array}    [opts.themes]      Extra Docusaurus themes
 * @param {object}   [opts.overrides]   Deep-merged into the final config
 */
function createConfig(opts) {
  const product = resolveProduct(opts.product);
  const docsDir = opts.docsDir ?? 'docs';
  const editUrl = opts.repo
    ? `https://github.com/${opts.repo}/edit/main/${docsDir}/`
    : undefined;
  const api = opts.apiReference ? apiReferenceConfig(opts.apiReference) : { plugins: [], themes: [] };

  const config = {
    title: `Commerce Mind ${product.name}`,
    tagline: product.tagline,
    url: opts.url ?? product.url,
    baseUrl: '/',
    favicon: 'img/commercemind/symbol-purple.svg',
    trailingSlash: false,

    onBrokenLinks: 'throw',
    onBrokenAnchors: 'throw',
    markdown: {
      format: 'detect',
      mermaid: true,
      hooks: { onBrokenMarkdownLinks: 'throw' },
    },

    i18n: { defaultLocale: 'en', locales: ['en'] },

    staticDirectories: ['static', path.join(__dirname, 'static')],

    presets: [
      [
        'classic',
        {
          docs: {
            routeBasePath: '/',
            sidebarPath: './sidebars.js',
            editUrl,
            showLastUpdateTime: !!opts.repo,
            ...opts.docs,
          },
          blog: false,
          theme: {},
        },
      ],
    ],

    themes: [
      [path.join(__dirname, 'index.js'), { product, hideFromSearchEngines: !!opts.hideFromSearchEngines }],
      require.resolve('@docusaurus/theme-mermaid'),
      [
        require.resolve('@easyops-cn/docusaurus-search-local'),
        {
          hashed: true,
          indexBlog: false,
          docsRouteBasePath: '/',
          highlightSearchTermsOnTargetPage: true,
          explicitSearchResultPath: true,
        },
      ],
      ...api.themes,
      ...(opts.themes ?? []),
    ],

    plugins: [...api.plugins, ...(opts.plugins ?? [])],

    themeConfig: {
      image: 'img/commercemind/symbol-purple.svg',
      colorMode: { respectPrefersColorScheme: true },
      docs: { sidebar: { hideable: true, autoCollapseCategories: true } },
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      navbar: {
        title: product.name,
        hideOnScroll: false,
        logo: {
          alt: 'Commerce Mind',
          src: 'img/commercemind/symbol-color.svg',
          href: '/',
        },
        items: [
          ...(opts.navbarItems ?? []),
          { type: 'search', position: 'right' },
          { href: 'https://commercemind.se', label: 'Commerce Mind', position: 'right' },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: product.name,
            items: [{ label: 'Documentation', to: '/' }],
          },
          {
            title: 'Commerce Mind',
            items: [{ label: 'commercemind.se', href: 'https://commercemind.se' }],
          },
          {
            title: 'For AI assistants',
            items: [
              { label: 'llms.txt', href: 'pathname:///llms.txt' },
              { label: 'llms-full.txt', href: 'pathname:///llms-full.txt' },
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} Commerce Mind AB`,
      },
      prism: {
        // Token colors adjusted to reach WCAG AA on the brand code backgrounds.
        theme: withContrast(prismThemes.oneLight, '#f6f6f8'),
        darkTheme: withContrast(prismThemes.oneDark, '#120e25'),
        additionalLanguages: ['csharp', 'powershell', 'bash', 'http', 'sql', 'diff', 'json'],
      },
      mermaid: { theme: { light: 'neutral', dark: 'dark' } },
    },
  };

  return deepMerge(config, opts.overrides ?? {});
}

// The API reference gets its own docs instance with the OpenAPI page component, so the
// main docs keep the regular (much smaller) DocItem. The sidebar comes from the file that
// docusaurus-plugin-openapi-docs generates (see api-sidebars.js).
function apiReferenceConfig({ specPath, routeBasePath = 'api/reference', outputDir = 'api-reference' }) {
  process.env.CM_API_SIDEBAR_FILE = path.resolve(outputDir, 'sidebar');
  // Docusaurus requires the docs folder to exist before the pages are generated into it.
  require('fs').mkdirSync(path.resolve(outputDir), { recursive: true });
  return {
    plugins: [
      [
        '@docusaurus/plugin-content-docs',
        {
          id: 'api',
          path: outputDir,
          routeBasePath,
          sidebarPath: path.join(__dirname, 'api-sidebars.js'),
          docItemComponent: '@theme/ApiItem',
        },
      ],
      [
        'docusaurus-plugin-openapi-docs',
        {
          id: 'openapi',
          docsPluginId: 'api',
          config: {
            api: {
              specPath,
              outputDir,
              sidebarOptions: { groupPathsBy: 'tag', categoryLinkSource: 'tag' },
            },
          },
        },
      ],
    ],
    themes: ['docusaurus-theme-openapi-docs'],
  };
}

function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (isPlainObject(value) && isPlainObject(target[key])) {
      target[key] = deepMerge({ ...target[key] }, value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

module.exports = { createConfig, products };
