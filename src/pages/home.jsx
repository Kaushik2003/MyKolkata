import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import {
  FaArrowRight, FaCalendarAlt, FaChevronRight, FaCloudSun, FaHeart, FaMapMarkerAlt,
  FaNewspaper, FaPalette, FaRegHeart, FaSearch, FaShoppingBag, FaShoppingCart,
  FaStore, FaTrain, FaUsers, FaUtensils
} from 'react-icons/fa'
import styles from '../styles/Home.module.css'

const heroShortcuts = [
  { label: 'News', icon: FaNewspaper, href: '/home#latest' },
  { label: 'Events', icon: FaCalendarAlt, href: '/pujo' },
  { label: 'Food', icon: FaUtensils, href: '/places?category=food' },
  { label: 'Shopping', icon: FaShoppingBag, href: '/places?category=shopping' },
  { label: 'Culture', icon: FaPalette, href: '/places?category=culture' },
  { label: 'Travel', icon: FaTrain, href: '/transport' }
]

// Editorial highlights. Swap for `/api/events` once an Event model exists.
const upcomingEvents = [
  {
    id: 'durga-puja-preparations',
    name: 'Durga Puja Preparations Begin',
    date: '12 Sep 2025',
    location: 'Kumartuli',
    image: '/dkt.jpg',
    href: '/pujo'
  },
  {
    id: 'kolkata-international-film-fest',
    name: 'Kolkata International Film Fest',
    date: '5 Nov 2025',
    location: 'Nandan',
    image: '/nscb.webp',
    href: '/places?category=culture'
  },
  {
    id: 'poila-boishakh',
    name: 'Poila Boishakh Celebrations',
    date: '15 Apr 2025',
    location: 'Various Locations',
    image: '/maidan.jpg',
    href: '/places?category=culture'
  }
]

// Static snapshot until a weather provider is wired up.
const weatherNow = {
  temperature: '28°C',
  summary: 'Partly cloudy',
  feelsLike: '32°C',
  humidity: '72%',
  wind: '12 km/h'
}

const newsBadges = [
  { label: 'News', className: styles.badge },
  { label: 'Event', className: `${styles.badge} ${styles.badgeEvent}` },
  { label: 'Sports', className: `${styles.badge} ${styles.badgeSports}` }
]

const RELATIVE_UNITS = [
  { limit: 60, unit: 'minute', ms: 60 * 1000 },
  { limit: 24, unit: 'hour', ms: 60 * 60 * 1000 },
  { limit: 30, unit: 'day', ms: 24 * 60 * 60 * 1000 }
]

function relativeTime(value) {
  if (!value) return null
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return null

  const elapsed = Date.now() - then
  if (elapsed < 60 * 1000) return 'just now'

  for (const { limit, unit, ms } of RELATIVE_UNITS) {
    const amount = Math.floor(elapsed / ms)
    if (amount < limit) return `${amount}${unit[0]} ago`
  }
  return `${Math.floor(elapsed / (30 * 24 * 60 * 60 * 1000))}mo ago`
}

function SectionHeading({ icon: Icon, title, href, id }) {
  return (
    <div className={styles.sectionHeading}>
      <div className={styles.sectionTitle}>
        <span className={styles.sectionIcon} aria-hidden="true"><Icon /></span>
        <h2 id={id}>{title}</h2>
      </div>
      {href && (
        <Link href={href} className={styles.viewAll}>
          View all <FaArrowRight aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}

function CardSkeletons({ count }) {
  return (
    <div className={styles.cardGrid} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={`${styles.skeleton} ${styles.skeletonCard}`} />
      ))}
    </div>
  )
}

function Home() {
  const router = useRouter()
  const [news, setNews] = useState([])
  const [marketplace, setMarketplace] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [saved, setSaved] = useState(() => new Set())

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [newsRes, marketRes] = await Promise.all([
        fetch('/api/news'),
        fetch('/api/marketplace')
      ])
      if (!newsRes.ok || !marketRes.ok) throw new Error('Failed to fetch data')
      const [newsData, marketData] = await Promise.all([newsRes.json(), marketRes.json()])
      setNews(newsData)
      setMarketplace(marketData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const toggleSaved = useCallback((id) => {
    setSaved((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSearch = useCallback((event) => {
    event.preventDefault()
    const term = query.trim()
    router.push(term ? `/places?q=${encodeURIComponent(term)}` : '/places')
  }, [query, router])

  const newsCards = useMemo(() => news.slice(0, 3), [news])
  const marketCards = useMemo(() => marketplace.slice(0, 3), [marketplace])

  return (
    <div className={styles.root}>
      <Head>
        <title>MyKolkata — Welcome to Kolkata</title>
        <meta
          name="description"
          content="Discover stories, events, places and people that make Kolkata special."
        />
      </Head>

      <section className={styles.hero} aria-labelledby="home-title">
        <img
          className={styles.heroImage}
          src="/hwh.jpg"
          alt="Howrah Bridge over the Hooghly at sunset with boats on the river"
          loading="eager"
        />
        <div className={styles.heroShade} />

        <div className={styles.heroContent}>
          <div className={styles.heroCopy}>
            <p className={styles.heroKicker}>
              <span>Culture</span>
              <span>Community</span>
              <span>Opportunities</span>
            </p>
            <h1 id="home-title">
              <span>Welcome to</span>
              <span className={styles.heroCity}>Kolkata!</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Discover stories, events, places and people that make the city special.
            </p>

            <form className={styles.searchForm} role="search" noValidate onSubmit={handleSearch}>
              <label className={styles.srOnly} htmlFor="home-search">Search MyKolkata</label>
              <FaSearch className={styles.searchIcon} aria-hidden="true" />
              <input
                id="home-search"
                type="search"
                placeholder="Search for events, places, news, products..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                autoComplete="off"
              />
              <button type="submit" className={styles.searchSubmit}>Search</button>
            </form>

            <nav className={styles.heroShortcuts} aria-label="Browse by category">
              {heroShortcuts.map(({ label, icon: Icon, href }) => (
                <Link key={label} href={href} className={styles.heroShortcut}>
                  <span className={styles.heroShortcutIcon} aria-hidden="true"><Icon /></span>
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <p className={styles.heroSignature} aria-hidden="true">More Than a City</p>
      </section>

      <div className={styles.layout}>
        <div className={styles.main}>
          <section id="latest" aria-labelledby="latest-heading">
            <SectionHeading
              icon={FaNewspaper}
              title="Latest from Kolkata"
              href="/places"
              id="latest-heading"
            />

            {loading && <CardSkeletons count={3} />}

            {!loading && error && (
              <div className={styles.stateBlock}>
                <p className={styles.stateError}>Could not load the latest updates.</p>
                <p>{error}</p>
                <button type="button" className={styles.retry} onClick={fetchData}>Try again</button>
              </div>
            )}

            {!loading && !error && newsCards.length === 0 && (
              <div className={styles.stateBlock}>
                <p>No stories yet. Check back soon.</p>
              </div>
            )}

            {!loading && !error && newsCards.length > 0 && (
              <div className={styles.cardGrid}>
                {newsCards.map((item, index) => {
                  const id = item.id || item._id
                  const badge = newsBadges[index % newsBadges.length]
                  const stamp = relativeTime(item.createdAt)
                  return (
                    <article key={id} className={styles.card}>
                      <div className={styles.cardMedia}>
                        <span className={badge.className}>{badge.label}</span>
                        {item.image && <img src={item.image} alt="" loading="lazy" />}
                        {stamp && <span className={styles.timeStamp}>{stamp}</span>}
                      </div>
                      <div className={styles.cardBody}>
                        <h3 className={styles.cardTitle}>
                          <a href={item.link} target="_blank" rel="noopener noreferrer">
                            {item.title}
                          </a>
                        </h3>
                        {item.description && <p className={styles.cardText}>{item.description}</p>}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          <section aria-labelledby="marketplace-heading">
            <SectionHeading
              icon={FaStore}
              title="Local Marketplace"
              href="/places?category=shopping"
              id="marketplace-heading"
            />

            {loading && <CardSkeletons count={3} />}

            {!loading && !error && marketCards.length === 0 && (
              <div className={styles.stateBlock}>
                <p>Nothing listed right now.</p>
              </div>
            )}

            {!loading && !error && marketCards.length > 0 && (
              <div className={styles.cardGrid}>
                {marketCards.map((item) => {
                  const id = item.id || item._id
                  const isSaved = saved.has(id)
                  return (
                    <article key={id} className={styles.card}>
                      <div className={styles.cardMedia}>
                        <button
                          type="button"
                          className={`${styles.wishlist} ${isSaved ? styles.wishlistOn : ''}`}
                          aria-pressed={isSaved}
                          aria-label={`${isSaved ? 'Remove' : 'Save'} ${item.title}`}
                          onClick={() => toggleSaved(id)}
                        >
                          {isSaved ? <FaHeart aria-hidden="true" /> : <FaRegHeart aria-hidden="true" />}
                        </button>
                        {item.image && <img src={item.image} alt="" loading="lazy" />}
                      </div>
                      <div className={styles.cardBody}>
                        <h3 className={styles.cardTitle}>{item.title}</h3>
                        {item.location && <p className={styles.cardText}>{item.location}</p>}
                        {item.price && <p className={styles.priceRow}>{item.price}</p>}
                        <a
                          className={styles.marketAction}
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaShoppingCart aria-hidden="true" />
                          View Details
                          <span className={styles.srOnly}> for {item.title}</span>
                        </a>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>

        <aside className={styles.aside} aria-label="City snapshot">
          <section className={styles.weather} aria-labelledby="weather-heading">
            <img className={styles.weatherArt} src="/maidan.jpg" alt="" aria-hidden="true" loading="lazy" />
            <h2 id="weather-heading" className={styles.weatherPlace}>
              <FaMapMarkerAlt aria-hidden="true" /> Kolkata
            </h2>
            <div className={styles.weatherMain}>
              <div className={styles.weatherNow}>
                <FaCloudSun className={styles.weatherIcon} aria-hidden="true" />
                <div>
                  <p className={styles.weatherTemp}>{weatherNow.temperature}</p>
                  <p className={styles.weatherSummary}>{weatherNow.summary}</p>
                </div>
              </div>
              <dl className={styles.weatherStats}>
                <div className={styles.weatherStat}><dt>Feels like</dt><dd><b>{weatherNow.feelsLike}</b></dd></div>
                <div className={styles.weatherStat}><dt>Humidity</dt><dd><b>{weatherNow.humidity}</b></dd></div>
                <div className={styles.weatherStat}><dt>Wind</dt><dd><b>{weatherNow.wind}</b></dd></div>
              </dl>
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="events-heading">
            <SectionHeading
              icon={FaCalendarAlt}
              title="Upcoming Events"
              href="/pujo"
              id="events-heading"
            />
            <div className={styles.eventList}>
              {upcomingEvents.map((event) => (
                <Link key={event.id} href={event.href} className={styles.eventItem}>
                  <img className={styles.eventThumb} src={event.image} alt="" loading="lazy" />
                  <div>
                    <p className={styles.eventName}>{event.name}</p>
                    <div className={styles.eventMeta}>
                      <span><FaCalendarAlt aria-hidden="true" /> {event.date}</span>
                      <span><FaMapMarkerAlt aria-hidden="true" /> {event.location}</span>
                    </div>
                  </div>
                  <FaChevronRight className={styles.eventChevron} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.contribute} aria-labelledby="contribute-heading">
            <img className={styles.contributeArt} src="/hwh.jpg" alt="" aria-hidden="true" loading="lazy" />
            <div className={styles.contributeHead}>
              <FaUsers className={styles.contributeIcon} aria-hidden="true" />
              <h2 id="contribute-heading">Be a Part of MyKolkata</h2>
            </div>
            <p className={styles.contributeText}>
              Share stories, list your business, suggest places and help build a better Kolkata.
            </p>
            <Link href="/contribute" className={styles.contributeCta}>
              Contribute Now <FaArrowRight aria-hidden="true" />
            </Link>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default Home
