import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FaArrowRight, FaBookOpen, FaCoffee, FaCompass, FaFire, FaLandmark,
  FaMap, FaMapMarkerAlt, FaPalette, FaSearch, FaShoppingBag, FaStar, FaTimes, FaUtensils
} from 'react-icons/fa'
import {
  allExploreItems, categories, collections, filterExploreItems,
  hiddenKolkata, nearbyPlaces, trendingPlaces
} from '../lib/exploreData'
import { fetchLivePlaces } from '../lib/livePlaces'
import styles from '../styles/Explore.module.css'

const KOLKATA = { lat: 22.5726, lng: 88.3639 }
const RESULT_BATCH_SIZE = 8

const categoryIcons = {
  coffee: FaCoffee,
  food: FaUtensils,
  place: FaLandmark,
  culture: FaPalette,
  shopping: FaShoppingBag,
  experience: FaCompass
}

const heroShortcuts = [
  { label: 'Food', icon: FaUtensils },
  { label: 'Places', icon: FaMapMarkerAlt },
  { label: 'Culture', icon: FaPalette },
  { label: 'Experiences', icon: FaCompass }
]

function nearYouHref({ query, category, view = 'map', guide, locate } = {}) {
  const params = new URLSearchParams({ view })
  if (query) params.set('q', query)
  if (category && category !== 'All') params.set('category', category)
  if (guide) params.set('guide', guide)
  if (locate) params.set('locate', '1')
  return `/near-you?${params}`
}

function guideHref(item) {
  return nearYouHref({ ...item.destination, guide: item.id })
}

function SectionHeading({ eyebrow, title, action, titleId }) {
  return (
    <div className={styles.sectionHeading}>
      <div>
        {eyebrow && <p className={styles.sectionEyebrow}>{eyebrow}</p>}
        <h2 id={titleId}>{title}</h2>
      </div>
      {action}
    </div>
  )
}

function ExploreResultVisual({ item }) {
  if (item.image) return <img src={item.image} alt="" width="640" height="420" />
  const category = categories.find((entry) => entry.name === item.category)
  const Icon = categoryIcons[category?.icon] || FaMapMarkerAlt
  return (
    <div className={styles.resultVisualFallback} aria-label={`Photo not available for ${item.name}`} role="img">
      <Icon aria-hidden="true" />
      <span>{item.category || 'Kolkata place'}</span>
      <small>Photo coming soon</small>
    </div>
  )
}

function ExploreResultsSkeleton() {
  return (
    <div className={styles.resultGrid} aria-hidden="true">
      {Array.from({ length: RESULT_BATCH_SIZE }, (_, index) => (
        <div key={index} className={styles.resultSkeleton}>
          <div className={styles.skeletonMedia} />
          <div className={styles.skeletonBody}>
            <span />
            <strong />
            <small />
          </div>
        </div>
      ))}
    </div>
  )
}

function Explore() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [liveResults, setLiveResults] = useState(null)
  const [searchStatus, setSearchStatus] = useState('idle')
  const [isComposing, setIsComposing] = useState(false)
  const [visibleResultCount, setVisibleResultCount] = useState(RESULT_BATCH_SIZE)
  const [requestVersion, setRequestVersion] = useState(0)
  const searchRef = useRef(null)
  const isFiltering = Boolean(query.trim()) || activeCategory !== 'All'
  const filteredItems = useMemo(
    () => filterExploreItems(allExploreItems, query, activeCategory),
    [query, activeCategory]
  )
  const displayedItems = searchStatus === 'success' && liveResults
    ? liveResults
    : !isFiltering && searchStatus === 'idle'
      ? filteredItems
      : []
  const visibleResults = displayedItems.slice(0, visibleResultCount)
  const remainingResultCount = Math.max(0, displayedItems.length - visibleResults.length)
  const resultsTitle = searchStatus === 'loading'
    ? 'Finding Kolkata picks…'
    : query.trim()
      ? (displayedItems.length ? `Results for “${query.trim()}”` : 'No matches yet')
      : activeCategory !== 'All'
        ? (displayedItems.length ? `${activeCategory} to explore` : `No ${activeCategory.toLowerCase()} yet`)
        : `${displayedItems.length} Kolkata picks`

  // Hydrate search and category from the URL so links into Explore (from Home,
  // for example) land on the filter the visitor actually asked for.
  useEffect(() => {
    if (!router.isReady) return
    const { q, category } = router.query
    const nextQuery = typeof q === 'string' ? q : ''
    const requested = typeof category === 'string' ? category.toLowerCase() : ''
    const matched = categories.find((entry) => entry.name.toLowerCase() === requested)

    if (nextQuery) setQuery(nextQuery)
    if (matched) setActiveCategory(matched.name)
    if (nextQuery || matched) setSearchStatus('loading')
    // Runs on first ready render only; later changes come from the controls.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  useEffect(() => {
    const text = query.trim()
    if (!isFiltering || isComposing || (text && text.length < 2)) {
      setLiveResults(null)
      setSearchStatus('idle')
      return undefined
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSearchStatus('loading')
      const params = new URLSearchParams({
        lat: String(KOLKATA.lat),
        lng: String(KOLKATA.lng),
        limit: '20'
      })
      if (activeCategory !== 'All') params.set('category', activeCategory)
      if (text) params.set('q', text)

      try {
        const endpoint = text ? '/api/explore/search' : '/api/explore/nearby'
        const result = await fetchLivePlaces(`${endpoint}?${params}`, { signal: controller.signal })
        setLiveResults(result.places)
        setSearchStatus('success')
      } catch (error) {
        if (error.name === 'AbortError') return
        setLiveResults(null)
        setSearchStatus('error')
      }
    }, 300)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [activeCategory, isComposing, isFiltering, query, requestVersion])

  useEffect(() => {
    setVisibleResultCount(RESULT_BATCH_SIZE)
  }, [activeCategory, query])

  const clearSearch = () => {
    setQuery('')
    setLiveResults(null)
    setSearchStatus(activeCategory === 'All' ? 'idle' : 'loading')
    searchRef.current?.focus()
  }

  const resetDiscovery = () => {
    setQuery('')
    setActiveCategory('All')
    setLiveResults(null)
    setSearchStatus('idle')
    searchRef.current?.focus()
  }

  const changeQuery = (nextQuery) => {
    setQuery(nextQuery)
    setLiveResults(null)
    const text = nextQuery.trim()
    setSearchStatus(activeCategory !== 'All' || text.length >= 2 ? 'loading' : 'idle')
  }

  const changeCategory = (nextCategory) => {
    setActiveCategory(nextCategory)
    setLiveResults(null)
    setSearchStatus(nextCategory !== 'All' || query.trim().length >= 2 ? 'loading' : 'idle')
  }

  return (
    <>
      <Head>
        <title>Explore — MyKolkata</title>
        <meta name="description" content="Discover cafés, food, culture and memorable experiences across Kolkata." />
      </Head>

      <main className={styles.root}>
        <section className={styles.hero} aria-labelledby="explore-title">
          <img
            className={styles.heroImage}
            src="/explore-hero-v2.webp"
            alt="Kolkata at blue hour with a yellow taxi, bookstalls and Howrah Bridge"
            width="1942"
            height="809"
          />
          <div className={styles.heroShade} />
          <div className={styles.heroTopline}>
            <span className={styles.cityTag}><FaMapMarkerAlt aria-hidden="true" /> Kolkata</span>
          </div>
          <div className={styles.heroContent}>
            <div className={styles.heroCopy}>
              <p className={styles.heroKicker}>Explore Kolkata</p>
              <h1 id="explore-title">
                <span>Find your next</span>
                <span><strong className={styles.heroCity}>Kolkata</strong> plan.</span>
              </h1>
              <p className={styles.heroSubtitle}>Good food, quiet corners and stories worth leaving home for.</p>

              <div className={styles.heroActions}>
                <form className={styles.searchForm} role="search" noValidate onSubmit={(event) => event.preventDefault()}>
                  <label className={styles.srOnly} htmlFor="explore-search">Search Kolkata</label>
                  <FaSearch className={styles.searchIcon} aria-hidden="true" />
                  <input
                    ref={searchRef}
                    id="explore-search"
                    type="search"
                    value={query}
                    onChange={(event) => changeQuery(event.target.value)}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={(event) => {
                      setIsComposing(false)
                      changeQuery(event.currentTarget.value)
                    }}
                    placeholder="Search food, cafés, places…"
                    autoComplete="off"
                  />
                  {query && (
                    <button type="button" className={styles.clearButton} onClick={clearSearch} aria-label="Clear search">
                      <FaTimes aria-hidden="true" />
                    </button>
                  )}
                </form>
                <Link href={nearYouHref({ locate: true })} className={styles.nearYouButton}>
                  <FaMap aria-hidden="true" />
                  <span><strong>Near you</strong><small>Open live map</small></span>
                  <FaArrowRight aria-hidden="true" />
                </Link>
              </div>
              <div className={styles.heroShortcuts} aria-label="Explore shortcuts">
                {heroShortcuts.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    className={query.trim().toLowerCase() === label.toLowerCase() ? styles.heroShortcutActive : undefined}
                    aria-pressed={query.trim().toLowerCase() === label.toLowerCase()}
                    onClick={() => {
                      changeQuery(label)
                      searchRef.current?.focus()
                    }}
                  >
                    <Icon aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className={styles.pageShell}>
          {!query.trim() && (
            <section className={`${styles.categorySection} ${activeCategory !== 'All' ? styles.categorySectionActive : ''}`} aria-labelledby="category-title">
              <SectionHeading eyebrow="Pick a mood" title="Explore by category" titleId="category-title" />
              <div className={styles.categoryGrid}>
                {categories.map((category) => {
                  const Icon = categoryIcons[category.icon]
                  const isActive = activeCategory === category.name
                  return (
                    <button
                      key={category.name}
                      type="button"
                      className={`${styles.categoryButton} ${styles[category.accent]} ${isActive ? styles.categoryActive : ''}`}
                      aria-pressed={isActive}
                      onClick={() => changeCategory(isActive ? 'All' : category.name)}
                    >
                      <span className={styles.categoryIcon}><Icon aria-hidden="true" /></span>
                      <span>{category.name}</span>
                    </button>
                  )
                })}
              </div>
            </section>
          )}

          {isFiltering && (
            <section className={styles.resultsSection} aria-labelledby="results-title">
              <SectionHeading
                eyebrow="Your search"
                title={resultsTitle}
                titleId="results-title"
                action={<button type="button" className={styles.textButton} onClick={resetDiscovery}>Clear filters</button>}
              />
              <p className={styles.srOnly} aria-live="polite">
                {searchStatus === 'loading' ? 'Searching live Kolkata places' : `${displayedItems.length} results found`}
              </p>
              {searchStatus === 'loading' ? (
                <ExploreResultsSkeleton />
              ) : searchStatus === 'error' ? (
                <div className={styles.noResults} role="status">
                  <FaCompass aria-hidden="true" />
                  <strong>We couldn’t load fresh Kolkata places.</strong>
                  <p>Check your connection and try the search again.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchStatus('loading')
                      setRequestVersion((version) => version + 1)
                    }}
                  >
                    Try again
                  </button>
                </div>
              ) : displayedItems.length ? (
                <>
                  <div className={styles.resultGrid}>
                    {visibleResults.map((item) => (
                      <Link key={item.id} href={nearYouHref({ query: item.name })} className={styles.resultCard} aria-label={`Show ${item.name} on the map`}>
                        <ExploreResultVisual item={item} />
                        <div><span>{item.category}</span><h3>{item.name}</h3><p>{item.area || item.count}</p></div>
                      </Link>
                    ))}
                  </div>
                  <div className={styles.resultActions}>
                    {remainingResultCount > 0 && (
                      <button
                        type="button"
                        className={styles.loadMore}
                        onClick={() => setVisibleResultCount((count) => count + RESULT_BATCH_SIZE)}
                      >
                        Show {Math.min(RESULT_BATCH_SIZE, remainingResultCount)} more
                      </button>
                    )}
                    <Link
                      href={nearYouHref({ query: query.trim(), category: activeCategory })}
                      className={styles.viewAllResults}
                    >
                      View all on map <FaArrowRight aria-hidden="true" />
                    </Link>
                  </div>
                </>
              ) : (
                <div className={styles.noResults}>
                  <FaCompass aria-hidden="true" />
                  <p>Try another neighbourhood, dish or kind of plan.</p>
                  <button type="button" onClick={resetDiscovery}>Show all picks</button>
                </div>
              )}
            </section>
          )}

          {!isFiltering && (
            <>
              <section className={styles.section} aria-labelledby="trending-title">
                <SectionHeading eyebrow="What the city is loving" title="Trending in Kolkata" titleId="trending-title" />
                <div className={styles.trendingGrid}>
                  {trendingPlaces.map((place, index) => (
                    <Link key={place.id} href={guideHref(place)} className={`${styles.trendingCard} ${index === 0 ? styles.trendingLead : ''}`} aria-label={`Open the ${place.name} guide`}>
                      <img src={place.image} alt="" width="1000" height="740" />
                      <div className={styles.cardShade} />
                      <div className={styles.trendingContent}>
                        <div className={styles.trendingMeta}>
                          <span><FaFire aria-hidden="true" /> {place.eyebrow}</span><span>{place.duration}</span>
                        </div>
                        <h3>{place.name}</h3>
                        <p>{place.description}</p>
                        <span className={styles.placeLine}><FaMapMarkerAlt aria-hidden="true" /> {place.area}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              <section id="near-you" className={styles.section} aria-labelledby="near-title">
                <SectionHeading
                  eyebrow="Good places to start"
                  title="Popular around Kolkata"
                  titleId="near-title"
                  action={<Link href={nearYouHref({ locate: true })} className={styles.seeAll}>Find near me <FaArrowRight aria-hidden="true" /></Link>}
                />
                <div className={styles.horizontalCards}>
                  {nearbyPlaces.slice(0, 5).map((place) => (
                    <Link key={place.id} href={nearYouHref({ query: place.name })} className={styles.placeCard} aria-label={`Explore ${place.name} on the map`}>
                      <div className={styles.placeImageWrap}>
                        <img src={place.image} alt="" width="640" height="480" />
                      </div>
                      <div className={styles.placeCardBody}>
                        <p>{place.category} · {place.area}</p>
                        <div><h3>{place.name}</h3><span className={styles.rating}><FaStar aria-hidden="true" /> {place.rating}</span></div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              <section className={`${styles.section} ${styles.hiddenSection}`} aria-labelledby="hidden-title">
                <SectionHeading eyebrow="For the curious" title="Hidden Kolkata" titleId="hidden-title" />
                <div className={styles.hiddenGrid}>
                  <Link href={guideHref(hiddenKolkata[0])} className={styles.hiddenLead} aria-label={`Open ${hiddenKolkata[0].name}`}>
                    <img src={hiddenKolkata[0].image} alt="" width="900" height="620" />
                    <div className={styles.hiddenLeadContent}>
                      <span>{hiddenKolkata[0].note}</span><h3>{hiddenKolkata[0].name}</h3><p>{hiddenKolkata[0].description}</p>
                    </div>
                  </Link>
                  <div className={styles.hiddenList}>
                    {hiddenKolkata.slice(1).map((place) => (
                      <Link key={place.id} href={guideHref(place)} className={styles.hiddenRow} aria-label={`Open ${place.name}`}>
                        <img src={place.image} alt="" width="260" height="220" />
                        <div><p>{place.area}</p><h3>{place.name}</h3><span>{place.note}</span></div>
                      </Link>
                    ))}
                  </div>
                </div>
              </section>

              <section className={styles.section} aria-labelledby="collections-title">
                <SectionHeading eyebrow="Made for wandering" title="Explore Kolkata" titleId="collections-title" />
                <div className={styles.collectionGrid}>
                  {collections.map((collection) => (
                    <Link key={collection.id} href={guideHref(collection)} className={`${styles.collectionCard} ${styles[collection.tone]}`} aria-label={`Open the ${collection.name} collection`}>
                      <img src={collection.image} alt="" width="720" height="420" />
                      <div className={styles.collectionContent}>
                        <FaBookOpen aria-hidden="true" />
                        <div><h3>{collection.name}</h3><p>{collection.count}</p></div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </>
  )
}

export default Explore
