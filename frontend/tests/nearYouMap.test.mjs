import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const pageSource = await readFile(new URL('../app/(main)/near-you/NearYouClient.tsx', import.meta.url), 'utf8')
const mapSource = await readFile(new URL('../components/explore/NearYouMap.tsx', import.meta.url), 'utf8')
const stylesSource = await readFile(new URL('../styles/NearYou.module.css', import.meta.url), 'utf8')
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

test('Ola map places use real photos or category markers while grouped places use native count clusters', () => {
  assert.equal(packageSource.dependencies['olamaps-web-sdk'], '1.3.0')
  assert.match(mapSource, /import\('olamaps-web-sdk'\)/)
  assert.match(mapSource, /new OlaMaps\(\{ apiKey \}\)/)
  assert.match(mapSource, /cluster: true/)
  assert.match(mapSource, /getClusterExpansionZoom/)
  assert.match(mapSource, /image\.src = source/)
  assert.match(mapSource, /CATEGORY_MARKERS/)
  assert.match(mapSource, /mykolkata-category-/)
  assert.match(mapSource, /map\.addImage\(imageId, imageData\)/)
  assert.doesNotMatch(mapSource, /PLACE_RING_LAYER_ID|mykolkata-place-rings/)
  assert.match(mapSource, /context\.arc\(32, 32, 29/)
  assert.doesNotMatch(mapSource, /index \+ 1/)
  assert.doesNotMatch(mapSource, /leaflet|OpenStreetMap/i)
  assert.doesNotMatch(pageSource, /leaflet|OpenStreetMap/i)
})

test('selected map photos use a restrained highlight ring — the one crimson on the map', () => {
  assert.match(mapSource, /'circle-radius': 30/)
  assert.match(mapSource, /'circle-stroke-width': 2/)
  assert.match(mapSource, /'circle-color': '#d72638'/)
  assert.doesNotMatch(mapSource, /'circle-radius': 34/)
})

test('Ola map configuration fails visibly and safely when the browser key is missing', () => {
  assert.match(mapSource, /process\.env\.NEXT_PUBLIC_OLA_MAPS_API_KEY/)
  assert.match(mapSource, /setStatus\('missing-key'\)/)
  assert.match(mapSource, /Ola Maps is ready to connect\./)
})

test('Ola resource diagnostics are redacted without treating optional style warnings as fatal', () => {
  assert.match(mapSource, /map\.on\('error'/)
  assert.match(mapSource, /safeErrorMessage\(event\?\.error\)/)
  assert.match(mapSource, /api_key=/)
  assert.doesNotMatch(mapSource, /map\.on\('error',[\s\S]{0,300}setStatus/)
  assert.match(mapSource, /Check your connection and map credentials/)
})

test('the map is always the dark style — there is no theme to switch', () => {
  assert.match(mapSource, /default-dark-standard\/style\.json/)
  assert.doesNotMatch(mapSource, /default-light-standard/)
  assert.doesNotMatch(mapSource, /useTheme|darkMode|setStyle|styledata/)
  assert.match(mapSource, /style: MAP_STYLE/)
  assert.match(mapSource, /\}, \[attempt\]\)/)
  assert.match(mapSource, /map\.moveLayer\(layerId\)/)
})

test('map markers use brand surfaces and letters, not a rainbow', () => {
  assert.match(mapSource, /cafes: \{ color: '#3f0d12', label: 'C' \}/)
  assert.match(mapSource, /places: \{ color: '#1c2225', label: 'P' \}/)
  assert.doesNotMatch(mapSource, /#3157e5|#7946a8|#24765f|#f5c344|Manrope/)
  assert.match(stylesSource, /\.userMarker\s*\{[^}]*background: var\(--mk-taxi\)/s)
})

test('map mode fills the viewport and floats its controls under the notch bar', () => {
  assert.match(stylesSource, /\.mapMode\s*\{[^}]*height: 100dvh/s)
  assert.match(stylesSource, /\.mapFrame\s*\{[^}]*position: absolute;[^}]*inset: 0/s)
  assert.match(stylesSource, /\.mapOverlay\s*\{[^}]*position: absolute;[^}]*top: calc\(var\(--mk-nav\) \+ 8px\)/s)
  assert.match(stylesSource, /\.controlDeck\s*\{[^}]*backdrop-filter: blur\(26px\) saturate\(180%\)/s)
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
  assert.match(stylesSource, /@media \(max-width: 767px\)[\s\S]*?\.filterStack\s*\{[^}]*top: calc\(100% \+ 8px\);[^}]*max-height: min\(58dvh,480px\);[^}]*overflow-y: auto/s)
  assert.doesNotMatch(stylesSource, /\.filterStack\s*\{[^}]*position: fixed/s)
})

test('mobile category and area chips support horizontal touch scrolling', () => {
  assert.match(stylesSource, /@media \(max-width: 767px\)[\s\S]*?\.categoryFilters, \.areaFilters\s*\{[^}]*overflow-x: auto;[^}]*touch-action: pan-x pan-y;[^}]*-webkit-overflow-scrolling: touch;/s)
  assert.match(stylesSource, /\.categoryFilters button, \.areaFilters button\s*\{[^}]*flex: 0 0 auto;/s)
  assert.match(pageSource, /function FilterScroller/)
  assert.doesNotMatch(pageSource, /setPointerCapture|onPointerMove=|onClickCapture=/)
  assert.match(pageSource, /onClick=\{\(\) => onCategoryChange\(item\)\}/)
  assert.match(pageSource, /onClick=\{\(\) => onAreaChange\(item\)\}/)
})

test('Near You never labels generic category artwork as a venue photo', () => {
  assert.match(pageSource, /place\.hasRealImage && place\.image/)
  assert.match(pageSource, /Photo not available for \$\{place\.name\}/)
  assert.match(pageSource, /<PlaceVisual place=\{place\}/)
})

test('Near You uses truthful loading skeletons instead of demo-place fallbacks', () => {
  assert.match(pageSource, /function PlaceResultsSkeleton\(\{ layout \}\)/)
  assert.match(pageSource, /dataStatus === 'loading' \? \(\s*<PlaceResultsSkeleton layout=\{view\}/s)
  assert.match(pageSource, /<AlponaLoader label="Loading fresh Kolkata places"/)
  assert.match(pageSource, /dataStatus === 'success' && !visiblePlaces\.length/)
  assert.doesNotMatch(pageSource, /setDataPlaces\(nearbyPlaces/)
  assert.doesNotMatch(pageSource, /Showing saved Kolkata picks/)
  assert.match(stylesSource, /\.placeSkeleton/)
  assert.doesNotMatch(stylesSource, /@keyframes/)
})

test('Near You only presents distance as user-relative after location is known', () => {
  assert.match(pageSource, /showDistance && place\.distance/)
  assert.match(pageSource, /locationKnown \? 'Near you' : 'Kolkata map'/)
  assert.match(pageSource, /userPosition \? 'Near You' : 'Explore Kolkata'/)
  assert.match(pageSource, /if \(userPosition\) \{\s*params\.set\('lat'/s)
  assert.match(pageSource, /routeLocate === '1'/)
})

test('curated Explore guides retain context while loading useful place queries', () => {
  assert.match(pageSource, /findExploreGuide\(routeGuideId\)/)
  assert.match(pageSource, /activeGuide\?\.name/)
  assert.match(pageSource, /activeGuide\?\.description/)
  assert.match(stylesSource, /\.guideIntro/)
})

test('Search this area applies the current geographic viewport', () => {
  assert.match(mapSource, /bounds\.getNorth\(\)/)
  assert.match(mapSource, /bounds\.getSouth\(\)/)
  assert.match(pageSource, /setRequestBounds\(pendingBounds\)/)
  assert.match(pageSource, /\/api\/explore\/map/)
  assert.match(pageSource, /Object\.entries\(requestBounds\)/)
  assert.match(pageSource, />\s*Search this area\s*</)
})

test('Near You sets type from the brand families, never from weight or capitals', () => {
  assert.doesNotMatch(stylesSource, /Anek|Manrope|@font-face/)
  assert.match(stylesSource, /font-family: var\(--mk-display\)/)
  assert.doesNotMatch(stylesSource, /font-weight:\s*[5-9]00/)
  assert.doesNotMatch(stylesSource, /text-transform:\s*uppercase/)
})

test('Near You renders without the undefined Head element and without mojibake', () => {
  assert.doesNotMatch(pageSource, /<Head>|â€/)
  assert.doesNotMatch(mapSource, /â€/)
})

test('Near You search is the house line input, which draws its focus rule', () => {
  assert.match(pageSource, /className=\{`mk-line \$\{styles\.searchBox\}`\}/)
  assert.doesNotMatch(stylesSource, /\.root input:focus-visible/)
})

test('Near You map chrome sits on the brand surfaces', () => {
  assert.match(stylesSource, /\.map :global\(\.maplibregl-ctrl-group\)[^}]*background: var\(--mk-ink\)/s)
  assert.match(stylesSource, /\.placeDetails\s*\{[^}]*background: var\(--mk-ink\)/s)
  assert.doesNotMatch(stylesSource, /:global\(\.dark\)|leaflet-tile-pane|#14243a/)
})
