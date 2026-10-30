// @ts-check
// Bundles each entry in size-checks/ the way an app would and reports its size
// and which Firebase SDK packages end up in it. Run after `pnpm run build`.
//
// Exits non-zero if an entry's Firebase products differ from its policy. Extra
// products are the regression this guards against: none of them declare
// `sideEffects`, so once imported they can't be tree-shaken and apps pay for
// them in full. Missing ones mean the entry no longer measures what it's for.
import { readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { build } from 'esbuild'

const ENTRIES_DIR = new URL('../size-checks/', import.meta.url)

/** The Firebase products vuefire wraps. Policies may only name these. */
const KNOWN_PRODUCTS = [
  '@firebase/app-check',
  '@firebase/auth',
  '@firebase/database',
  '@firebase/firestore',
  '@firebase/storage',
]

/** Shared SDK internals every product builds on; any other `@firebase/*` is a product. */
const CORE_PACKAGES = [
  '@firebase/app',
  '@firebase/component',
  '@firebase/logger',
  '@firebase/util',
  '@firebase/webchannel-wrapper',
]

/**
 * The Firebase products each entry must bundle — exactly these, no more, no
 * less. Every entry needs a policy and every policy needs an entry, so neither
 * can be added or removed without the other.
 */
const PRODUCTS = {
  'vuefire-app-check.js': ['@firebase/app-check'],
  'vuefire-auth.js': ['@firebase/auth'],
  'vuefire-firestore.js': ['@firebase/firestore'],
  'vuefire-full.js': KNOWN_PRODUCTS,
  'vuefire-plugin.js': [],
  'vuefire-rtdb.js': ['@firebase/database'],
  'vuefire-storage.js': ['@firebase/storage'],
}

const entries = (await readdir(ENTRIES_DIR))
  .filter((f) => f.endsWith('.js'))
  .sort()

const policyErrors = [
  ...entries
    .filter((entry) => !Object.hasOwn(PRODUCTS, entry))
    .map((entry) => `${entry} has no policy: add it to PRODUCTS`),
  ...Object.keys(PRODUCTS)
    .filter((entry) => !entries.includes(entry))
    .map((entry) => `PRODUCTS has a policy for ${entry}, which doesn't exist`),
  ...Object.entries(PRODUCTS).flatMap(([entry, products]) =>
    products
      .filter((pkg) => !KNOWN_PRODUCTS.includes(pkg))
      .map((pkg) => `${entry}: unknown product ${pkg}`)
  ),
]
if (policyErrors.length) {
  for (const error of policyErrors) console.error(`✗ ${error}`)
  process.exit(1)
}

const results = await Promise.all(entries.map(measure))

let failed = false
for (const { entry, min, gzip, firebasePackages } of results) {
  console.log(
    `${entry.padEnd(22)} ${kb(min).padStart(9)} min ${kb(gzip).padStart(9)} gzip  ${[...firebasePackages].sort().join(' ')}`
  )
  const expected = PRODUCTS[/** @type {keyof typeof PRODUCTS} */ (entry)]
  const unexpected = [...firebasePackages].filter(
    (pkg) => !CORE_PACKAGES.includes(pkg) && !expected.includes(pkg)
  )
  const missing = expected.filter((pkg) => !firebasePackages.has(pkg))
  if (unexpected.length) {
    console.error(`  ✗ ${entry} should not bundle ${unexpected.join(', ')}`)
    failed = true
  }
  if (missing.length) {
    console.error(`  ✗ ${entry} should bundle ${missing.join(', ')}`)
    failed = true
  }
}

if (failed) process.exit(1)

/** @param {string} entry */
async function measure(entry) {
  const result = await build({
    entryPoints: [fileURLToPath(new URL(entry, ENTRIES_DIR))],
    bundle: true,
    minify: true,
    format: 'esm',
    platform: 'browser',
    external: ['vue', 'vue-demi'],
    metafile: true,
    write: false,
    logLevel: 'error',
  })
  const code = result.outputFiles[0].contents
  const firebasePackages = new Set(
    Object.values(result.metafile.outputs)
      .flatMap((output) => Object.entries(output.inputs))
      // files esbuild read but tree-shook away entirely still show up, with 0 bytes
      .filter(([, { bytesInOutput }]) => bytesInOutput > 0)
      .map(([input]) => input)
      .map((input) => input.match(/.*node_modules\/(@firebase\/[^/]+)\//)?.[1])
      .filter(Boolean)
  )
  return {
    entry,
    min: code.length,
    gzip: gzipSync(code).length,
    firebasePackages,
  }
}

/** @param {number} bytes */
function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)} kB`
}
