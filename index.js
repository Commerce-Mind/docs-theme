const path = require('path');
const fs = require('fs/promises');
const { resolveProduct } = require('./products');

// Docusaurus theme plugin. Provides:
//  - brand CSS (Infima tokens, fonts, components)
//  - product accent colors injected as CSS variables
//  - global MDX components and a "Copy page" toolbar on every doc
//  - llms.txt, llms-full.txt and a raw .md copy of every doc page at build time
//  - optional _headers file that keeps the site out of search engines
module.exports = function commerceMindTheme(context, options) {
  const product = resolveProduct(options.product);
  const c = product.colors;
  let docs = [];

  return {
    name: '@commercemind/docusaurus-theme',

    getThemePath() {
      return path.resolve(__dirname, 'src/theme');
    },

    getClientModules() {
      return [
        require.resolve('@fontsource-variable/instrument-sans/index.css'),
        require.resolve('@fontsource-variable/schibsted-grotesk/index.css'),
        require.resolve('@fontsource-variable/jetbrains-mono/index.css'),
        path.resolve(__dirname, 'src/css/theme.css'),
      ];
    },

    injectHtmlTags() {
      return {
        headTags: [
          {
            tagName: 'style',
            innerHTML:
              `:root{--cm-graphic:${c.graphic};--cm-accent:${c.text};}` +
              `html[data-theme='dark']:root{--cm-graphic:${c.graphicDark};--cm-accent:${c.textDark};}`,
          },
        ],
      };
    },

    async allContentLoaded({ allContent }) {
      const docsContent = allContent['docusaurus-plugin-content-docs'] ?? {};
      docs = Object.values(docsContent).flatMap((instance) =>
        (instance.loadedVersions ?? [])
          .filter((version) => version.isLast)
          .flatMap((version) => version.docs),
      );
    },

    async postBuild({ outDir, siteConfig }) {
      const siteUrl = siteConfig.url.replace(/\/$/, '');
      const pages = [];

      for (const doc of docs) {
        if (doc.frontMatter?.draft || doc.frontMatter?.unlisted) continue;
        // Generated OpenAPI pages (*.api.mdx, *.info.mdx, *.tag.mdx) are JSX, not prose.
        if (/\.(api|info|tag|schema)\.mdx$/.test(doc.source)) continue;
        const sourcePath = doc.source.replace(/^@site[\\/]/, `${context.siteDir}/`);
        const raw = await fs.readFile(sourcePath, 'utf8');
        const markdown = toPlainMarkdown(raw, doc.title);
        const mdPath = markdownPathFor(doc.permalink);
        await fs.mkdir(path.dirname(path.join(outDir, mdPath)), { recursive: true });
        await fs.writeFile(path.join(outDir, mdPath), markdown);
        pages.push({ ...doc, markdown, mdUrl: `${siteUrl}/${mdPath}` });
      }

      const index = [
        `# ${product.name}`,
        '',
        `> ${siteConfig.tagline || product.tagline}`,
        '',
        '## Docs',
        '',
        ...pages.map(
          (p) => `- [${p.title}](${p.mdUrl})${p.description ? `: ${p.description}` : ''}`,
        ),
        '',
      ].join('\n');

      const full = pages
        .map((p) => `<!-- ${siteUrl}${p.permalink} -->\n\n${p.markdown}`)
        .join('\n\n---\n\n');

      if (options.hideFromSearchEngines) {
        // An HTTP header (read by Cloudflare Pages and Netlify), not a <meta> tag:
        // the local search plugin skips pages that have a noindex meta tag.
        const headersPath = path.join(outDir, '_headers');
        let existing = '';
        try {
          existing = await fs.readFile(headersPath, 'utf8');
        } catch {}
        await fs.writeFile(headersPath, `${existing}/*
  X-Robots-Tag: noindex, nofollow
`);
      } else {
        // Point crawlers at the sitemap. A robots.txt from the site's static folder wins.
        const robotsPath = path.join(outDir, 'robots.txt');
        const hasOwn = await fs.access(robotsPath).then(() => true, () => false);
        if (!hasOwn) {
          await fs.writeFile(robotsPath, `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
        }
      }

      await fs.writeFile(path.join(outDir, 'llms.txt'), index);
      await fs.writeFile(path.join(outDir, 'llms-full.txt'), full);
    },
  };
};

// "/" -> "index.md", "/guides/install" and "/guides/install/" -> "guides/install.md"
// (same file whether or not the site uses trailingSlash)
function markdownPathFor(permalink) {
  const clean = permalink.replace(/^\/+|\/+$/g, '');
  return clean === '' ? 'index.md' : `${clean}.md`;
}

// Strip front matter and MDX imports so the file reads well for people and LLMs.
function toPlainMarkdown(raw, title) {
  let body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  body = body.replace(/^import\s.+?;?\s*$/gm, '').replace(/^\s+/, '');
  if (!/^#\s/.test(body)) body = `# ${title}\n\n${body}`;
  return body;
}

module.exports.markdownPathFor = markdownPathFor;
