import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import test from 'node:test'

const pageSource = await readFile(new URL('../app/(main)/places/page.tsx', import.meta.url), 'utf8')
const stylesSource = await readFile(new URL('../styles/Explore.module.css', import.meta.url), 'utf8')
const heroAsset = await stat(new URL('../public/explore-hero-v2.webp', import.meta.url))

test('Explore hero leads with a useful Kolkata plan and direct map action', () => {
  assert.match(pageSource, /Find your next Kolkata plan\./)
  assert.match(pageSource, /nearYouHref\(\{ locate: true \}\)/)
  assert.match(pageSource, /Open the live map/)
  assert.doesNotMatch(pageSource, /Tonight’s easy plan|heroPlan|FaClock/)
  assert.doesNotMatch(pageSource, /CAL\s*24/)
})

test('Explore hero is the brand banner: a full-bleed photograph, a scrim, content bottom-left', () => {
  assert.match(pageSource, /src="\/explore-hero-v2\.webp"/)
  assert.ok(heroAsset.size > 50_000 && heroAsset.size < 500_000)
  assert.match(pageSource, /className="mk-banner"/)
  assert.match(pageSource, /className="mk-banner-img"/)
  assert.match(pageSource, /className="mk-banner-scrim"/)
  /* no accenting one word of a headline in a different colour — design.md §4.6 */
  assert.doesNotMatch(pageSource, /heroCity/)
})

test('Explore hero search is the house line input, and one primary button leads', () => {
  assert.match(pageSource, /className=\{`mk-line \$\{styles\.searchForm\}`\}/)
  assert.equal(pageSource.match(/mk-btn--primary/g)?.length, 1)
})

test('Explore hero provides desktop-only shortcuts that populate search', () => {
  assert.match(pageSource, /const heroShortcuts = \[/)
  assert.match(pageSource, /aria-label="Explore shortcuts"/)
  assert.match(pageSource, /changeQuery\(label\)/)
  assert.match(pageSource, /searchRef\.current\?\.focus\(\)/)
  assert.doesNotMatch(pageSource, /onClick=\{\(\) => setActiveCategory\(activeCategory === label/)
  assert.match(stylesSource, /@media \(max-width: 900px\)[\s\S]*\.heroShortcuts\s*\{[^}]*display: none/s)
})

test('Explore hides the large category section only while a text search is active', () => {
  assert.match(pageSource, /\{!query\.trim\(\) && \(\s*<section className=\{`\$\{styles\.categorySection\}/s)
  assert.doesNotMatch(pageSource, /\{!isFiltering && \(\s*<section className=\{styles\.categorySection\}/s)
})

test('Explore category results use a compact truthful result treatment', () => {
  assert.match(pageSource, /displayedItems\.length \? `\$\{activeCategory\} to explore`/)
  assert.match(pageSource, /<Card\s/)
  assert.match(stylesSource, /\.categorySectionActive \+ \.resultsSection/)
  assert.match(pageSource, /const RESULT_BATCH_SIZE = 8/)
  assert.match(pageSource, /displayedItems\.slice\(0, visibleResultCount\)/)
  assert.match(pageSource, /setVisibleResultCount\(\(count\) => count \+ RESULT_BATCH_SIZE\)/)
  assert.match(pageSource, /Show \{Math\.min\(RESULT_BATCH_SIZE, remainingResultCount\)\} more/)
  assert.match(pageSource, /View all on map/)
  assert.match(stylesSource, /\.resultActions/)
})

test('Explore loads with the alpona line and quiet placeholders — no spinner, no shimmer', () => {
  assert.match(pageSource, /function ExploreResultsSkeleton\(\)/)
  assert.match(pageSource, /searchStatus === 'loading' \? \(\s*<>\s*<AlponaLoader/s)
  assert.match(pageSource, /<ExploreResultsSkeleton \/>/)
  assert.match(pageSource, /!isFiltering && searchStatus === 'idle'/)
  assert.doesNotMatch(pageSource, /Showing saved Kolkata picks instead/)
  assert.match(stylesSource, /\.resultSkeleton/)
  assert.doesNotMatch(stylesSource, /@keyframes/)
})

test('editorial cards use curated destinations instead of searching their display titles', () => {
  assert.match(pageSource, /function guideHref\(item\)/)
  assert.match(pageSource, /href=\{guideHref\(place\)\}/)
  assert.match(pageSource, /href=\{guideHref\(lead\)\}/)
  assert.match(pageSource, /const \[lead, \.\.\.hiddenRest\] = hiddenKolkata/)
  assert.match(pageSource, /href=\{guideHref\(collection\)\}/)
  assert.doesNotMatch(pageSource, /nearYouHref\(\{ query: place\.name \}\).*trendingCard/)
})

test('Explore does not claim static recommendations are near the visitor', () => {
  assert.match(pageSource, /title="Popular around Kolkata"/)
  assert.match(pageSource, />Find near me</)
  assert.doesNotMatch(pageSource, /distanceBadge/)
})

test('Explore section titles avoid emoji decoration and Pujo content', () => {
  assert.match(pageSource, /title="Trending in Kolkata"/)
  assert.match(pageSource, /title="Hidden Kolkata"/)
  assert.doesNotMatch(pageSource, /🔥|📍|🤫|🗺️|Pujo|Pandal/i)
})

test('Explore sets type from the brand families and never from weight or capitals', () => {
  assert.doesNotMatch(stylesSource, /Anek|Manrope|@font-face/)
  assert.match(stylesSource, /font-family: var\(--mk-display\)/)
  assert.doesNotMatch(stylesSource, /font-weight:\s*[5-9]00/)
  assert.doesNotMatch(stylesSource, /text-transform:\s*uppercase/)
  assert.doesNotMatch(pageSource, /sectionEyebrow|eyebrow=/)
})

test('Explore keeps its responsive discovery layouts', () => {
  assert.match(stylesSource, /\.trendingGrid\s*\{[^}]*display: grid/s)
  assert.match(stylesSource, /@media \(max-width: 640px\)[\s\S]*\.trendingGrid\s*\{[^}]*display: flex/s)
  assert.match(stylesSource, /scroll-snap-type: x mandatory/)
})

test('Explore film frames scrim through Bordeaux, never flat black', () => {
  assert.match(stylesSource, /\.frameScrim\s*\{[^}]*rgba\(38,10,14,/s)
})
