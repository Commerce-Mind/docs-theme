// Sidebar for the API reference docs instance (see apiReferenceConfig in config.js).
// The items come from the sidebar.ts that docusaurus-plugin-openapi-docs generates. It's a
// plain object literal with a type annotation, so we strip the TypeScript and evaluate it
// instead of depending on how the config loader handles nested .ts requires.
const fs = require('fs');

function loadGeneratedSidebar(file) {
  const source = fs
    .readFileSync(file, 'utf8')
    .replace(/^import type .*$/gm, '')
    .replace(/const sidebar\s*:\s*\w+\s*=/, 'const sidebar =')
    .replace(/export default sidebar\.(\w+);/, 'module.exports = sidebar.$1;');
  const module = { exports: [] };
  new Function('module', source)(module);
  return module.exports;
}

let items = [];
const file = `${process.env.CM_API_SIDEBAR_FILE}.ts`;
if (fs.existsSync(file)) {
  try {
    items = loadGeneratedSidebar(file);
  } catch (e) {
    console.warn(`[@commercemind/docusaurus-theme] Could not read the API sidebar ${file}: ${e.message}`);
  }
} else {
  console.warn(`[@commercemind/docusaurus-theme] ${file} doesn't exist yet. Run \`npm run gen-api\`.`);
}

module.exports = {
  api: [{ type: 'link', label: '← Documentation', href: '/' }, ...items],
};
