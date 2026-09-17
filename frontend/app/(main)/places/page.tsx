// @ts-nocheck
'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  allExploreItems, categories, collections, filterExploreItems,
  hiddenKolkata, nearbyPlaces, trendingPlaces
} from '@/lib/exploreData'
import { fetchLivePlaces } from '@/lib/livePlaces'
import { Card } from '@/components/brand/Card'
import { SectionHead } from '@/components/brand/SectionHead'
import { Sprig } from '@/components/brand/kolka'
import { CityIcon, UiIcon } from '@/components/brand/icons'
import { AlponaLoader } from '@/components/brand/Alpona'
import styles from '@/styles/Explore.module.css'

const KOLKATA = { lat: 22.5726, lng: 88.3639 }
const RESULT_BATCH_SIZE = 8

/* each category's line icon — an icon with a job, beside its word */
const categoryIcons = {
  coffee: 'bhaar',
  food: 'phuchka',
  place: 'victoria',
  culture: 'book',
  shopping: 'signboard',
  experience: 'rickshaw'
}

const heroShortcuts = [
  { label: 'Food', icon: 'phuchka' },
  { label: 'Places', icon: 'victoria' },
  { label: 'Culture', icon: 'book' },
  { label: 'Experiences', icon: 'rickshaw' }
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

function iconForCategory(name) {
  const category = categories.find((entry) => entry.name === name)
  return categoryIcons[category?.icon] || 'howrah'
}

function ExploreResultsSkeleton() {
  return (
    <div className={styles.resultGrid} aria-hidden="true">
      {Array.from({ length: RESULT_BATCH_SIZE }, (_, index) => (
        <div key={index} className={styles.resultSkeleton}>
          <div className={`mk-skel ${styles.skeletonMedia}`} />
          <span className={`mk-skel-line ${styles.skeletonTitle}`} />
          <span className={`mk-skel-line ${styles.skeletonSub}`} />
        </div>
      ))}
    </div>
  )
}

function Explore() {
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
    ? 'Finding Kolkata picks'
    : query.trim()
      ? (displayedItems.length ? `Results for “${query.trim()}”` : 'Nothing matches that yet')
      : activeCategory !== 'All'
        ? (displayedItems.length ? `${activeCategory} to explore` : `No ${activeCategory.toLowerCase()} yet`)
        : `${displayedItems.length} Kolkata picks`

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

  const [lead, ...hiddenRest] = hiddenKolkata

  return (
    <main className={`mk-page ${styles.root}`}>
      <section className="mk-banner" aria-labelledby="explore-title">
        <img
          className="mk-banner-img"
          src="/explore-hero-v2.webp"
          alt="Kolkata at blue hour after rain, a yellow taxi on the wet street and the Howrah Bridge lit up beyond"
          width="1942"
          height="809"
          style={{ objectPosition: '56% 58%' }}
        />
        <div className="mk-banner-scrim" aria-hidden="true" />
        <div className="mk-banner-content">
          <div className={styles.heroCopy}>
            <Sprig size={38} />
            <h1 id="explore-title" className="mk-display" style={{ marginTop: 8 }}>Find your next Kolkata plan.</h1>
            <p className="mk-banner-lede">Good food, quiet corners and stories worth leaving home for.</p>

            <div className={styles.heroActions}>
              <form className={`mk-line ${styles.searchForm}`} role="search" noValidate onSubmit={(event) => event.preventDefault()}>
                <label className="sr-only" htmlFor="explore-search">Search Kolkata</label>
                <UiIcon name="search" size={20} />
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
                  placeholder="Search a café, a dish, a para"
                  autoComplete="off"
                />
                {query && (
                  <button type="button" className="mk-icon-btn mk-icon-btn--bare" onClick={clearSearch} aria-label="Clear search">
                    <UiIcon name="close" />
                  </button>
                )}
              </form>
              <Link href={nearYouHref({ locate: true })} className="mk-btn mk-btn--primary">
                Open the live map <span className="mk-btn-arrow" aria-hidden="true">→</span>
              </Link>
            </div>

            <div className={`mk-chips ${styles.heroShortcuts}`} role="group" aria-label="Explore shortcuts">
              {heroShortcuts.map(({ label, icon }) => (
                <button
                  key={label}
                  type="button"
                  className="mk-chip"
                  aria-pressed={query.trim().toLowerCase() === label.toLowerCase()}
                  onClick={() => {
                    changeQuery(label)
                    searchRef.current?.focus()
                  }}
                >
                  <CityIcon name={icon} size={20} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mk-wrap">
        {!query.trim() && (
          <section className={`${styles.categorySection} ${activeCategory !== 'All' ? styles.categorySectionActive : ''}`} aria-labelledby="category-title">
            <SectionHead id="category-title" title="Explore by category" />
            <div className={styles.categoryGrid}>
              {categories.map((category) => {
                const isActive = activeCategory === category.name
                return (
                  <button
                    key={category.name}
                    type="button"
                    className={`mk-chip ${styles.categoryButton}`}
                    aria-pressed={isActive}
                    onClick={() => changeCategory(isActive ? 'All' : category.name)}
                  >
                    <CityIcon name={categoryIcons[category.icon]} size={24} />
                    <span>{category.name}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {isFiltering && (
          <section className={styles.resultsSection} aria-labelledby="results-title">
            <SectionHead
              id="results-title"
              title={resultsTitle}
              action={<button type="button" className="mk-btn mk-btn--text" onClick={resetDiscovery}>Clear filters</button>}
            />
            <p className="sr-only" aria-live="polite">
              {searchStatus === 'loading' ? 'Searching live Kolkata places' : `${displayedItems.length} results found`}
            </p>
            {searchStatus === 'loading' ? (
              <>
                <AlponaLoader label="Looking across the city" className={styles.loader} />
                <ExploreResultsSkeleton />
              </>
            ) : searchStatus === 'error' ? (
              <div className={`mk-panel mk-empty ${styles.state}`} role="status">
                <h3 className="mk-h3">Fresh Kolkata places didn&apos;t load.</h3>
                <p className="mk-body">Check your connection, then try the search again.</p>
                <button
                  type="button"
                  className="mk-btn mk-btn--secondary"
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
                    <Card
                      key={item.id}
                      href={nearYouHref({ query: item.name })}
                      ariaLabel={`Show ${item.name} on the map`}
                      image={item.image}
                      icon={iconForCategory(item.category)}
                      fallbackLabel={item.category || 'Kolkata place'}
                      title={item.name}
                      sub={item.area || item.count}
                      desc={item.category}
                    />
                  ))}
                </div>
                <div className={styles.resultActions}>
                  {remainingResultCount > 0 && (
                    <button
                      type="button"
                      className="mk-btn mk-btn--secondary"
                      onClick={() => setVisibleResultCount((count) => count + RESULT_BATCH_SIZE)}
                    >
                      Show {Math.min(RESULT_BATCH_SIZE, remainingResultCount)} more
                    </button>
                  )}
                  <Link
                    href={nearYouHref({ query: query.trim(), category: activeCategory })}
                    className="mk-btn mk-btn--text"
                  >
                    View all on map
                  </Link>
                </div>
              </>
            ) : (
              <div className={`mk-panel mk-empty ${styles.state}`}>
                <h3 className="mk-h3">Nothing matches that yet.</h3>
                <p className="mk-body">Try another neighbourhood, dish or kind of plan.</p>
                <button type="button" className="mk-btn mk-btn--secondary" onClick={resetDiscovery}>Show all picks</button>
              </div>
            )}
          </section>
        )}

        {!isFiltering && (
          <>
            <section className={styles.section} aria-labelledby="trending-title">
              <SectionHead id="trending-title" title="Trending in Kolkata" lede="What the city is making time for this week." />
              <div className={styles.trendingGrid}>
                {trendingPlaces.map((place, index) => (
                  <Link key={place.id} href={guideHref(place)} className={`${styles.frame} ${index === 0 ? styles.trendingLead : ''}`} aria-label={`Open the ${place.name} guide`}>
                    <img className={styles.frameImg} src={place.image} alt="" width="1000" height="740" />
                    <div className={styles.frameScrim} aria-hidden="true" />
                    <div className={styles.frameContent}>
                      <p className={styles.frameKicker}>{place.eyebrow}</p>
                      <h3 className={styles.frameTitle}>{place.name}</h3>
                      <p className={styles.frameDesc}>{place.description}</p>
                      <p className={styles.frameMeta}>
                        <span>{place.area}</span>
                        <span className={styles.frameTime}>{place.duration}</span>
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section id="near-you" className={styles.section} aria-labelledby="near-title">
              <SectionHead
                id="near-title"
                title="Popular around Kolkata"
                lede="Good places to start, wherever you are in the city."
                action={<Link href={nearYouHref({ locate: true })} className="mk-btn mk-btn--text">Find near me</Link>}
              />
              <div className={`mk-row ${styles.rowOffset}`}>
                {nearbyPlaces.slice(0, 5).map((place) => (
                  <Card
                    key={place.id}
                    href={nearYouHref({ query: place.name })}
                    ariaLabel={`Explore ${place.name} on the map`}
                    image={place.image}
                    icon={iconForCategory(place.category)}
                    title={place.name}
                    sub={place.area}
                    desc={`${place.category}, rated ${place.rating}`}
                  />
                ))}
              </div>
            </section>

            <section className={styles.section} aria-labelledby="hidden-title">
              <SectionHead id="hidden-title" title="Hidden Kolkata" lede="For the curious, and the ones who take the long way." />
              <div className={styles.hiddenGrid}>
                <Link href={guideHref(lead)} className={`${styles.frame} ${styles.hiddenLead}`} aria-label={`Open ${lead.name}`}>
                  <img className={styles.frameImg} src={lead.image} alt="" width="900" height="620" />
                  <div className={styles.frameScrim} aria-hidden="true" />
                  <div className={styles.frameContent}>
                    <p className={styles.frameKicker}>{lead.note}</p>
                    <h3 className={styles.frameTitle}>{lead.name}</h3>
                    <p className={styles.frameDesc}>{lead.description}</p>
                  </div>
                </Link>
                <div className={styles.hiddenList}>
                  {hiddenRest.map((place) => (
                    <Link key={place.id} href={guideHref(place)} className={styles.hiddenRow} aria-label={`Open ${place.name}`}>
                      <span className={styles.hiddenThumb}>
                        <img src={place.image} alt="" width="260" height="220" />
                      </span>
                      <span className={styles.hiddenText}>
                        <span className="mk-meta">{place.area}</span>
                        <span className={styles.hiddenTitle}>{place.name}</span>
                        <span className={styles.hiddenNote}>{place.note}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>

            <section className={styles.section} aria-labelledby="collections-title">
              <SectionHead id="collections-title" title="Made for wandering" lede="Collections to follow on a slow afternoon." />
              <div className={styles.collectionGrid}>
                {collections.map((collection) => (
                  <Link key={collection.id} href={guideHref(collection)} className={`${styles.frame} ${styles.collectionCard}`} aria-label={`Open the ${collection.name} collection`}>
                    <img className={styles.frameImg} src={collection.image} alt="" width="720" height="420" />
                    <div className={styles.frameScrim} aria-hidden="true" />
                    <div className={styles.frameContent}>
                      <h3 className={styles.collectionTitle}>{collection.name}</h3>
                      <p className={styles.frameMeta}><span>{collection.count}</span></p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}

export default Explore
