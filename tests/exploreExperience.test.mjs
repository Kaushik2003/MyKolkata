import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import test from 'node:test'

const pageSource = await readFile(new URL('../src/pages/places.jsx', import.meta.url), 'utf8')
const stylesSource = await readFile(new URL('../src/styles/Explore.module.css', import.meta.url), 'utf8')
const heroAsset = await stat(new URL('../public/explore-hero-v2.webp', import.meta.url))

test('Explore hero leads with a useful Kolkata plan and direct map action', () => {
  assert.match(pageSource, /<span>Find your next<\/span>/)
  assert.match(pageSource, /<\/strong> plan\.<\/span>/)
  assert.match(pageSource, /className=\{styles\.heroCity\}>Kolkata<\/strong>/)
  assert.match(pageSource, /nearYouHref\(\{ locate: true \}\)/)
  assert.match(pageSource, /Open live map/)
  assert.doesNotMatch(pageSource, /Tonight’s easy plan|heroPlan|FaClock/)
  assert.doesNotMatch(pageSource, /CAL\s*24/)
})

test('Explore hero uses a full-bleed Kolkata image with an editorial headline treatment', () => {
  assert.match(pageSource, /src="\/explore-hero-v2\.webp"/)
  assert.ok(heroAsset.size > 50_000 && heroAsset.size < 500_000)
  assert.match(stylesSource, /\.heroImage\s*\{[^}]*inset: 0;[^}]*width: 100%/s)
  assert.match(stylesSource, /\.hero h1 > span\s*\{[^}]*display: block/s)
  assert.match(stylesSource, /\.heroCity\s*\{[^}]*color: var\(--amber\)/s)
  assert.doesNotMatch(stylesSource, /\.heroPlan|\.planLabel/)
  assert.doesNotMatch(pageSource, /City plans, handpicked/)
})

test('Explore hero provides desktop-only shortcuts that populate search', () => {
  assert.match(pageSource, /const heroShortcuts = \[/)
  assert.match(pageSource, /aria-label="Explore shortcuts"/)
  assert.match(pageSource, /changeQuery\(label\)/)
  assert.match(pageSource, /searchRef\.current\?\.focus\(\)/)
  assert.doesNotMatch(pageSource, /onClick=\{\(\) => setActiveCategory\(activeCategory === label/)
  assert.match(stylesSource, /\.heroShortcuts\s*\{[^}]*display: flex/s)
  assert.match(stylesSource, /\.heroShortcuts \.heroShortcutActive:hover\s*\{[^}]*background: var\(--amber\)/s)
  assert.match(stylesSource, /@media \(max-width: 900px\)[\s\S]*\.heroShortcuts\s*\{[^}]*display: none/s)
})

test('Explore hides the large category section only while a text search is active', () => {
  assert.match(pageSource, /\{!query\.trim\(\) && \(\s*<section className=\{`\$\{styles\.categorySection\}/s)
  assert.doesNotMatch(pageSource, /\{!isFiltering && \(\s*<section className=\{styles\.categorySection\}/s)
})

test('Explore category results use a compact truthful result treatment', () => {
  assert.match(pageSource, /displayedItems\.length \? `\$\{activeCategory\} to explore`/)
  assert.match(pageSource, /<ExploreResultVisual item=\{item\}/)
  assert.match(stylesSource, /\.categorySectionActive \+ \.resultsSection/)
  assert.match(stylesSource, /\.resultVisualFallback/)
  assert.match(pageSource, /const RESULT_BATCH_SIZE = 8/)
  assert.match(pageSource, /displayedItems\.slice\(0, visibleResultCount\)/)
  assert.match(pageSource, /setVisibleResultCount\(\(count\) => count \+ RESULT_BATCH_SIZE\)/)
  assert.match(pageSource, /Show \{Math\.min\(RESULT_BATCH_SIZE, remainingResultCount\)\} more/)
  assert.match(pageSource, /View all on map/)
  assert.match(stylesSource, /\.resultActions/)
})

test('Explore shows matching skeletons while fresh results load', () => {
  assert.match(pageSource, /function ExploreResultsSkeleton\(\)/)
  assert.match(pageSource, /searchStatus === 'loading' \? \(\s*<ExploreResultsSkeleton/s)
  assert.match(pageSource, /!isFiltering && searchStatus === 'idle'/)
  assert.doesNotMatch(pageSource, /Showing saved Kolkata picks instead/)
  assert.match(stylesSource, /\.resultSkeleton/)
  assert.match(stylesSource, /@keyframes skeletonSweep/)
})

test('editorial cards use curated destinations instead of searching their display titles', () => {
  assert.match(pageSource, /function guideHref\(item\)/)
  assert.match(pageSource, /href=\{guideHref\(place\)\}/)
  assert.match(pageSource, /href=\{guideHref\(hiddenKolkata\[0\]\)\}/)
  assert.match(pageSource, /href=\{guideHref\(collection\)\}/)
  assert.doesNotMatch(pageSource, /nearYouHref\(\{ query: place\.name \}\).*trendingCard/)
})

test('Explore does not claim static recommendations are near the visitor', () => {
  assert.match(pageSource, /title="Popular around Kolkata"/)
  assert.match(pageSource, />Find near me /)
  assert.doesNotMatch(pageSource, /className=\{styles\.distanceBadge\}/)
})

test('Explore section titles avoid emoji decoration and Pujo content', () => {
  assert.match(pageSource, /title="Trending in Kolkata"/)
  assert.match(pageSource, /title="Hidden Kolkata"/)
  assert.doesNotMatch(pageSource, /🔥|📍|🤫|🗺️|Pujo|Pandal/i)
})

test('Explore uses scoped self-hosted typography and responsive discovery layouts', () => {
  assert.match(stylesSource, /font-family: "Anek Kolkata"/)
  assert.match(stylesSource, /font-family: "Manrope Kolkata"/)
  assert.match(stylesSource, /url\("\/fonts\/anek-latin-variable\.woff2"\)/)
  assert.match(stylesSource, /\.trendingGrid\s*\{[^}]*display: grid/s)
  assert.match(stylesSource, /@media \(max-width: 640px\)[\s\S]*\.trendingGrid\s*\{[^}]*display: flex/s)
})

test('Explore search focus follows the rounded search container', () => {
  assert.match(stylesSource, /\.searchForm:focus-within\s*\{[^}]*outline:/s)
  assert.match(stylesSource, /\.searchForm input:focus-visible\s*\{[^}]*outline: none/s)
  assert.doesNotMatch(stylesSource, /\.root input:focus-visible/)
})

test('Explore dark mode separates surface and on-dark foreground tokens', () => {
  assert.match(stylesSource, /--surface: #fff/)
  assert.match(stylesSource, /--on-dark: #fff/)
  assert.match(stylesSource, /:global\(\.dark\) \.root\s*\{[^}]*--surface: #14243a/s)
  assert.doesNotMatch(stylesSource, /--white/)
  assert.match(stylesSource, /\.hero\s*\{[^}]*color: var\(--on-dark\)/s)
  assert.match(stylesSource, /\.trendingCard\s*\{[^}]*color: var\(--on-dark\)/s)
  assert.doesNotMatch(stylesSource, /\.trendingCard,[^{]*\{[^}]*color:\s*inherit/s)
})
