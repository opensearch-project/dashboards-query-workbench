/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Build-time guard against `MODULE_NOT_FOUND` at OSD boot.
 *
 * `plugin-helpers build` copies server-side files into the plugin artifact using the
 * `serverSourcePatterns` globs from `.opensearch_dashboards-plugin-helpers.json`. Those globs run
 * with `allowEmpty: true` and nothing cross-checks them against what the code actually `require()`s,
 * so a server file importing a directory the globs omit produces a perfectly green build and a fatal
 * boot failure on the host:
 *
 *   Cannot find module '../../common/utils/deployment_capabilities'
 *
 * Browser code is immune because @osd/optimizer inlines its imports into the webpack bundle; only
 * server code does a real runtime `require()` against the copied tree.
 *
 * This walks the actual boot path -- breadth-first from `server/index`, exactly as Node does when
 * OSD loads the plugin -- and asserts every relative hop lands on a file the packaging step will
 * ship. The shipped set is produced by the same library with the same options as
 * `write_server_files.ts`, so glob semantics cannot drift between the two.
 *
 * Reachability matters: scanning every shipped file instead would flag browser-only helpers that sit
 * in `common/` and jest-only files under `test/`, neither of which the server ever requires.
 *
 * Limitations, stated plainly:
 *   - Specifiers are found by regex, so a computed `require(someVar)` is invisible here.
 *   - Only relative specifiers are checked. Bare package names are `yarn install`'s problem, and
 *     specifiers that escape the plugin root resolve against the OSD tree, which is out of scope.
 *   - A type-only import that babel would erase is still treated as a real requirement, so this can
 *     ask you to ship a file the runtime would not have needed. That direction is deliberate: the
 *     cost is one extra file in the artifact, versus a production boot failure.
 */

const Fs = require('fs');
const Path = require('path');
const vfs = require('vinyl-fs');

const PLUGIN_DIR = Path.resolve(__dirname, '..');
const CONFIG_FILE = '.opensearch_dashboards-plugin-helpers.json';
const MANIFEST_FILE = 'opensearch_dashboards.json';

// Mirrors packages/osd-plugin-helpers/src/tasks/write_server_files.ts. If that task changes its
// defaults or its ignore list, these two constants are what need updating.
const DEFAULT_SERVER_SOURCE_PATTERNS = [
  'yarn.lock',
  'tsconfig.json',
  'package.json',
  'index.{js,ts}',
  '{lib,server,common,translations}/**/*',
];
const IGNORE = [
  '**/*.d.ts',
  '**/public/**',
  '**/__tests__/**',
  '**/*.{test,test.mocks,mock,mocks}.*',
];

// OSD requires `<plugin>/server/index.js`; these are the source spellings of that entry.
const SERVER_ENTRY_CANDIDATES = ['server/index.ts', 'server/index.tsx', 'server/index.js'];

const RESOLVE_EXTS = ['', '.ts', '.tsx', '.js', '.jsx', '.json'];

// `from './x'`, `require('./x')`, `import('./x')` -- relative specifiers only.
const SPECIFIER_RE = /(?:\bfrom\s*|\brequire\s*\(\s*|\bimport\s*\(\s*)['"](\.[^'"]*)['"]/g;

function readJson(name) {
  return JSON.parse(Fs.readFileSync(Path.resolve(PLUGIN_DIR, name), 'utf8'));
}

/**
 * Runs the packaging globs and returns the files that would be shipped, keyed by their
 * artifact-relative posix path, with contents attached.
 */
function listShippedFiles(patterns) {
  return new Promise((resolve, reject) => {
    const files = new Map();

    vfs
      .src([MANIFEST_FILE, ...patterns], {
        cwd: PLUGIN_DIR,
        base: PLUGIN_DIR,
        buffer: true,
        ignore: IGNORE,
        allowEmpty: true,
      })
      .on('data', (file) => {
        if (!file.isDirectory()) {
          files.set(file.relative.split(Path.sep).join('/'), file.contents);
        }
      })
      .on('error', reject)
      .on('end', () => resolve(files));
  });
}

/** Node-style resolution, restricted to the set of files that will actually be in the artifact. */
function resolveWithin(shipped, target) {
  for (const ext of RESOLVE_EXTS) {
    if (shipped.has(`${target}${ext}`)) {
      return `${target}${ext}`;
    }
  }
  for (const ext of RESOLVE_EXTS.filter(Boolean)) {
    if (shipped.has(`${target}/index${ext}`)) {
      return `${target}/index${ext}`;
    }
  }
  return null;
}

/** Breadth-first over relative imports, starting from the server entry point. */
function walkBootPath(shipped, entry) {
  const visited = new Set([entry]);
  const queue = [entry];
  const failures = [];
  const escapes = new Set();

  while (queue.length) {
    const file = queue.shift();
    const source = shipped.get(file).toString('utf8');

    for (const [, specifier] of source.matchAll(SPECIFIER_RE)) {
      const target = Path.posix.join(Path.posix.dirname(file), specifier);

      // Escapes the plugin root -- resolves against the OSD tree at runtime, not our artifact.
      if (target.startsWith('..')) {
        escapes.add(specifier);
        continue;
      }

      const resolved = resolveWithin(shipped, target);

      if (!resolved) {
        failures.push({ file, specifier, target });
        continue;
      }
      if (!visited.has(resolved)) {
        visited.add(resolved);
        queue.push(resolved);
      }
    }
  }

  return { failures, visited, escapes };
}

async function main() {
  const manifest = readJson(MANIFEST_FILE);

  if (!manifest.server) {
    console.log('[check-server-imports] manifest has no `server` -- nothing to boot, skipping');
    return;
  }

  let patterns = DEFAULT_SERVER_SOURCE_PATTERNS;
  let patternSource = `plugin-helpers defaults (no ${CONFIG_FILE})`;

  if (Fs.existsSync(Path.resolve(PLUGIN_DIR, CONFIG_FILE))) {
    const config = readJson(CONFIG_FILE);
    const configured = config.serverSourcePatterns || config.buildSourcePatterns;
    if (configured) {
      patterns = configured;
      patternSource = CONFIG_FILE;
    }
  }

  const shipped = await listShippedFiles(patterns);
  const entry = SERVER_ENTRY_CANDIDATES.find((candidate) => shipped.has(candidate));

  if (!entry) {
    console.error(
      `\n[check-server-imports] FAILED -- manifest declares \`server: true\` but none of ` +
        `${SERVER_ENTRY_CANDIDATES.join(', ')} would be shipped.\nOSD requires ` +
        `server/index.js at boot. Check serverSourcePatterns in ${CONFIG_FILE}.`
    );
    process.exitCode = 1;
    return;
  }

  const { failures, visited, escapes } = walkBootPath(shipped, entry);

  console.log(
    `[check-server-imports] ${shipped.size} files would ship; ${visited.size} reachable from ` +
      `${entry} (patterns from ${patternSource}); ${escapes.size} import(s) resolve against the ` +
      `OSD tree and were skipped`
  );

  if (!failures.length) {
    console.log('[check-server-imports] OK -- the whole server boot path is present in the artifact');
    return;
  }

  console.error(
    `\n[check-server-imports] FAILED -- ${failures.length} import(s) on the server boot path are ` +
      `missing from the artifact.\nThese resolve fine against the source tree, so tsc, eslint and ` +
      `jest all pass, but the file is never\ncopied into the build and OSD dies with ` +
      `MODULE_NOT_FOUND at boot.\n`
  );

  for (const { file, specifier } of failures) {
    console.error(`  ${file}`);
    console.error(`    imports '${specifier}' -- not in the shipped file set`);
  }

  const missingDirs = [...new Set(failures.map(({ target }) => target.split('/')[0]))].sort();
  console.error(
    `\nAdd the missing top-level director${missingDirs.length === 1 ? 'y' : 'ies'} to ` +
      `serverSourcePatterns in ${CONFIG_FILE}: ${missingDirs.join(', ')}`
  );

  process.exitCode = 1;
}

main().catch((error) => {
  console.error(`[check-server-imports] crashed: ${error.stack || error}`);
  process.exitCode = 1;
});
