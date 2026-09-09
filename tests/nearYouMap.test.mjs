import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const pageSource = await readFile(new URL('../src/pages/near-you.jsx', import.meta.url), 'utf8')
const mapSource = await readFile(new URL('../src/components/NearYouMap.jsx', import.meta.url), 'utf8')
const stylesSource = await readFile(new URL('../src/styles/NearYou.module.css', import.meta.url), 'utf8')
const packageSource = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

test('Near You opens in map mode and replaces the map for Grid or List', () => {
  assert.match(pageSource, /useState\('map'\)/)
  assert.match(pageSource, /view === 'map' \? \(/)
  assert.match(pageSource, /styles\.gridView : styles\.listView/)
  assert.match(pageSource, /styles\.mapMode : styles\.resultsMode/)
})

test('selected places offer a safe Google Maps coordinate link', () => {
  assert.match(pageSource, /https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/)
  assert.match(pageSource, /encodeURIComponent\(`\$\{place\.coordinates\.lat\},\$\{place\.coordinates\.lng\}`\)/)
  assert.match(pageSource, /target="_blank"/)
  assert.match(pageSource, /rel="noopener noreferrer"/)
  assert.match(pageSource, /Open \$\{place\.name\} in Google Maps/)
  assert.match(stylesSource, /\.detailsFooter a:hover/)
})

test('Ola map places use photography while grouped places use native count clusters', () => {
  assert.equal(packageSource.dependencies['olamaps-web-sdk'], '1.3.0')
  assert.match(mapSource, /import\('olamaps-web-sdk'\)/)
  assert.match(mapSource, /new OlaMaps\(\{ apiKey \}\)/)
  assert.match(mapSource, /cluster: true/)
  assert.match(mapSource, /getClusterExpansionZoom/)
  assert.match(mapSource, /image\.src = source/)
  assert.match(mapSource, /map\.addImage\(imageId, imageData\)/)
  assert.doesNotMatch(mapSource, /PLACE_RING_LAYER_ID|mykolkata-place-rings/)
  assert.match(mapSource, /context\.arc\(32, 32, 29/)
  assert.doesNotMatch(mapSource, /index \+ 1/)
  assert.doesNotMatch(mapSource, /leaflet|OpenStreetMap/i)
  assert.doesNotMatch(pageSource, /leaflet|OpenStreetMap/i)
})

test('selected map photos use a restrained highlight ring', () => {
  assert.match(mapSource, /'circle-radius': 30/)
  assert.match(mapSource, /'circle-stroke-width': 2/)
  assert.doesNotMatch(mapSource, /'circle-radius': 34/)
})

test('Ola map configuration fails visibly and safely when the browser key is missing', () => {
  assert.match(mapSource, /process\.env\.NEXT_PUBLIC_OLA_MAPS_API_KEY/)
  assert.match(mapSource, /setStatus\('missing-key'\)/)
  assert.match(mapSource, /Ola Maps is ready to connect\./)
  assert.match(mapSource, /default-light-standard\/style\.json/)
  assert.match(mapSource, /default-dark-standard\/style\.json/)
})

test('Ola resource diagnostics are redacted without treating optional style warnings as fatal', () => {
  assert.match(mapSource, /map\.on\('error'/)
  assert.match(mapSource, /safeErrorMessage\(event\?\.error\)/)
  assert.match(mapSource, /api_key=/)
  assert.doesNotMatch(mapSource, /map\.on\('error',[\s\S]{0,300}setStatus/)
  assert.match(mapSource, /Check your connection and map credentials/)
})

test('theme changes reuse the Ola map and restore custom place layers', () => {
  assert.match(mapSource, /map\.setStyle\(nextStyle, \{ diff: false \}\)/)
  assert.match(mapSource, /map\.on\('styledata', handleStyleData\)/)
  assert.match(mapSource, /restorePlaceLayers\(/)
  assert.match(mapSource, /map\.moveLayer\(layerId\)/)
  assert.match(mapSource, /activeStyleRef\.current === nextStyle/)
  assert.match(mapSource, /status !== 'ready' \|\| styleChangingRef\.current/)
  assert.match(mapSource, /\}, \[attempt\]\)/)
  assert.doesNotMatch(mapSource, /\[attempt, darkMode/)
  assert.match(mapSource, /styles\.mapThemeTransition/)
  assert.match(stylesSource, /\.mapThemeTransition\s*\{[^}]*height: 3px/s)
  assert.doesNotMatch(mapSource, /isStyleChanging[^\n]*mapStatus/)
})

test('map mode reserves the viewport between the fixed app navigation bars', () => {
  assert.match(stylesSource, /\.mapMode\s*\{[^}]*height: calc\(100dvh - 4rem\)/s)
  assert.match(stylesSource, /\.mapFrame\s*\{[^}]*position: absolute;[^}]*inset: 0/s)
  assert.match(stylesSource, /\.mapOverlay\s*\{[^}]*position: absolute/s)
})

test('Near You exposes compact filters and all three result views', () => {
  assert.match(pageSource, /aria-controls="near-you-filters"/)
  assert.match(pageSource, /aria-expanded=\{filtersOpen\}/)
  assert.match(pageSource, /const viewOptions = \[/)
  assert.match(pageSource, /id: 'map'/)
  assert.match(pageSource, /id: 'grid'/)
  assert.match(pageSource, /id: 'list'/)
  assert.match(pageSource, /event\.key === 'Escape'/)
  assert.doesNotMatch(stylesSource, /\.explorer \.viewToggle button \{ display: none; \}/)
})

test('mobile map filters stay below the control deck instead of escaping the viewport', () => {
  assert.match(stylesSource, /@media \(max-width: 640px\)[\s\S]*?\.filterStack\s*\{[^}]*position: absolute;[^}]*top: calc\(100% \+ \.5rem\);[^}]*max-height: min\(58dvh,480px\);[^}]*overflow-y: auto/s)
  assert.doesNotMatch(stylesSource, /@media \(max-width: 640px\)[\s\S]*?\.filterStack\s*\{[^}]*position: fixed;[^}]*bottom: 4\.5rem/s)
})

test('mobile category and area chips support horizontal touch scrolling', () => {
  assert.match(stylesSource, /@media \(max-width: 640px\)[\s\S]*?\.categoryFilters, \.areaFilters\s*\{[^}]*overflow-x: auto;[^}]*touch-action: pan-y;[^}]*-webkit-overflow-scrolling: touch;/s)
  assert.match(stylesSource, /\.categoryFilters button, \.areaFilters button\s*\{[^}]*flex: 0 0 auto;/s)
  assert.match(pageSource, /function FilterScroller/)
  assert.match(pageSource, /onPointerMove=/)
  assert.match(pageSource, /event\.currentTarget\.scrollLeft = drag\.scrollLeft - distance/)
  assert.match(pageSource, /onClickCapture=/)
})

test('Search this area applies the current geographic viewport', () => {
  assert.match(mapSource, /bounds\.getNorth\(\)/)
  assert.match(mapSource, /bounds\.getSouth\(\)/)
  assert.match(pageSource, /setViewportBounds\(pendingBounds\)/)
  assert.match(pageSource, /coordinates\.lat <= viewportBounds\.north/)
  assert.match(pageSource, />\s*Search this area\s*</)
})

test('Near You uses the scoped self-hosted design fonts', () => {
  assert.match(stylesSource, /url\("\/fonts\/anek-latin-variable\.woff2"\)/)
  assert.match(stylesSource, /url\("\/fonts\/manrope-variable\.woff2"\)/)
})

test('Near You search focus follows the rounded search container', () => {
  assert.match(stylesSource, /\.searchBox:focus-within\s*\{[^}]*border-color: var\(--blue\)/s)
  assert.match(stylesSource, /\.searchBox input:focus-visible\s*\{[^}]*outline: none/s)
  assert.doesNotMatch(stylesSource, /\.root input:focus-visible/)
})

test('Near You dark mode preserves readable controls, results, and map context', () => {
  assert.match(stylesSource, /:global\(\.dark\) \.mapIdentity[^}]*color: #f7f4ec/s)
  assert.match(stylesSource, /:global\(\.dark\) \.resultsSummary strong[^}]*color: #f7f4ec/s)
  assert.match(stylesSource, /:global\(\.dark\) \.cardFooter button[^}]*color: #f7f4ec/s)
  assert.match(stylesSource, /:global\(\.dark\) \.map :global\(\.maplibregl-ctrl-group\)[^}]*background: #14243a/s)
  assert.doesNotMatch(stylesSource, /leaflet-tile-pane/)
  assert.match(stylesSource, /:global\(\.dark\) \.placeDetails[^}]*background: rgba\(20,36,58,\.97\)/s)
})
