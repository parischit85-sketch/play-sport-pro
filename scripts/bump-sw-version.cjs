// Bump CACHE_VERSION in public/sw.js to force cache invalidation on each build
// Generates a version like vYYYYMMDDHHmmss

const fs = require('fs');
const path = require('path');

function timestampVersion() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const v = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  return `v${v}`;
}

function run() {
  const swPath = path.resolve(process.cwd(), 'public', 'sw.js');
  if (!fs.existsSync(swPath)) {
    console.error('[bump-sw-version] public/sw.js not found, skipping');
    process.exit(0);
  }

  const src = fs.readFileSync(swPath, 'utf8');
  const newVersion = timestampVersion();

  const updated = src.replace(
    /(const\s+CACHE_VERSION\s*=\s*)['"]v[0-9.\-]+['"];?/,
    `$1'${newVersion}';`
  );

  if (updated === src) {
    // Try a broader replace if the regex didn't match (fallback)
    const altUpdated = src.replace(
      /(CACHE_VERSION\s*=\s*)['"][^'"]+['"]/,
      `$1'${newVersion}'`
    );
    if (altUpdated === src) {
      console.warn('[bump-sw-version] No CACHE_VERSION pattern matched, skipping');
      process.exit(0);
    } else {
      fs.writeFileSync(swPath, altUpdated, 'utf8');
    }
  } else {
    fs.writeFileSync(swPath, updated, 'utf8');
  }

  console.log(`[bump-sw-version] Updated CACHE_VERSION to ${newVersion}`);
}

run();
