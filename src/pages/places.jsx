import Head from 'next/head'
import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'
import {
  FaArrowRight, FaBookOpen, FaCoffee, FaCompass, FaFire, FaLandmark,
  FaMap, FaMapMarkerAlt, FaPalette, FaSearch, FaShoppingBag, FaStar, FaTimes, FaUtensils
} from 'react-icons/fa'
import {
  allExploreItems, categories, collections, filterExploreItems,
  hiddenKolkata, nearbyPlaces, trendingPlaces
} from '../lib/exploreData'
import styles from '../styles/Explore.module.css'

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

function Explore() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const searchRef = useRef(null)
  const isFiltering = Boolean(query.trim()) || activeCategory !== 'All'
  const filteredItems = useMemo(
    () => filterExploreItems(allExploreItems, query, activeCategory),
    [query, activeCategory]
  )

  const clearSearch = () => {
    setQuery('')
    searchRef.current?.focus()
  }

  const resetDiscovery = () => {
    setQuery('')
    setActiveCategory('All')
    searchRef.current?.focus()
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
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search food, cafés, places…"
                    autoComplete="off"
                  />
                  {query && (
                    <button type="button" className={styles.clearButton} onClick={clearSearch} aria-label="Clear search">
                      <FaTimes aria-hidden="true" />
                    </button>
                  )}
                </form>
                <Link href="/near-you" className={styles.nearYouButton}>
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
                      setQuery(label)
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
            <section className={styles.categorySection} aria-labelledby="category-title">
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
                      onClick={() => setActiveCategory(isActive ? 'All' : category.name)}
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
                title={filteredItems.length ? `${filteredItems.length} Kolkata picks` : 'No matches yet'}
                titleId="results-title"
                action={<button type="button" className={styles.textButton} onClick={resetDiscovery}>Clear filters</button>}
              />
              <p className={styles.srOnly} aria-live="polite">{filteredItems.length} results found</p>
              {filteredItems.length ? (
                <div className={styles.resultGrid}>
                  {filteredItems.slice(0, 8).map((item) => (
                    <article key={item.id} className={styles.resultCard}>
                      <img src={item.image} alt="" width="640" height="420" />
                      <div><span>{item.category}</span><h3>{item.name}</h3><p>{item.area || item.count}</p></div>
                    </article>
                  ))}
                </div>
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
                    <article key={place.id} className={`${styles.trendingCard} ${index === 0 ? styles.trendingLead : ''}`}>
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
                    </article>
                  ))}
                </div>
              </section>

              <section id="near-you" className={styles.section} aria-labelledby="near-title">
                <SectionHeading
                  eyebrow="A short walk away"
                  title="Near you"
                  titleId="near-title"
                  action={<Link href="/near-you" className={styles.seeAll}>See all <FaArrowRight aria-hidden="true" /></Link>}
                />
                <div className={styles.horizontalCards}>
                  {nearbyPlaces.slice(0, 5).map((place) => (
                    <article key={place.id} className={styles.placeCard}>
                      <div className={styles.placeImageWrap}>
                        <img src={place.image} alt="" width="640" height="480" />
                        <span className={styles.distanceBadge}>{place.distance}</span>
                      </div>
                      <div className={styles.placeCardBody}>
                        <p>{place.category} · {place.area}</p>
                        <div><h3>{place.name}</h3><span className={styles.rating}><FaStar aria-hidden="true" /> {place.rating}</span></div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className={`${styles.section} ${styles.hiddenSection}`} aria-labelledby="hidden-title">
                <SectionHeading eyebrow="For the curious" title="Hidden Kolkata" titleId="hidden-title" />
                <div className={styles.hiddenGrid}>
                  <article className={styles.hiddenLead}>
                    <img src={hiddenKolkata[0].image} alt="" width="900" height="620" />
                    <div className={styles.hiddenLeadContent}>
                      <span>{hiddenKolkata[0].note}</span><h3>{hiddenKolkata[0].name}</h3><p>{hiddenKolkata[0].description}</p>
                    </div>
                  </article>
                  <div className={styles.hiddenList}>
                    {hiddenKolkata.slice(1).map((place) => (
                      <article key={place.id} className={styles.hiddenRow}>
                        <img src={place.image} alt="" width="260" height="220" />
                        <div><p>{place.area}</p><h3>{place.name}</h3><span>{place.note}</span></div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className={styles.section} aria-labelledby="collections-title">
                <SectionHeading eyebrow="Made for wandering" title="Explore Kolkata" titleId="collections-title" />
                <div className={styles.collectionGrid}>
                  {collections.map((collection) => (
                    <article key={collection.id} className={`${styles.collectionCard} ${styles[collection.tone]}`}>
                      <img src={collection.image} alt="" width="720" height="420" />
                      <div className={styles.collectionContent}>
                        <FaBookOpen aria-hidden="true" />
                        <div><h3>{collection.name}</h3><p>{collection.count}</p></div>
                      </div>
                    </article>
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
