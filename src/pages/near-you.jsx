import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FaArrowLeft, FaCoffee, FaCrosshairs, FaExternalLinkAlt, FaFilter, FaLandmark,
  FaList, FaMap, FaMapMarkerAlt, FaPalette, FaSearch, FaShoppingBag, FaStar,
  FaThLarge, FaTimes, FaTree, FaUtensils
} from 'react-icons/fa'
import NearYouMap from '../components/NearYouMap'
import { findExploreGuide, searchNearbyPlaces } from '../lib/exploreData'
import { fetchLivePlaces, fetchPlaceDetails } from '../lib/livePlaces'
import styles from '../styles/NearYou.module.css'

const nearCategories = ['All', 'Cafés', 'Food', 'Culture', 'Outdoors', 'Shopping', 'Experiences']
const KOLKATA = { lat: 22.5726, lng: 88.3639 }
const KOLKATA_BOUNDS = { west: 88.32, south: 22.52, east: 88.42, north: 22.62 }

const viewOptions = [
  { id: 'map', label: 'Map', Icon: FaMap },
  { id: 'grid', label: 'Grid', Icon: FaThLarge },
  { id: 'list', label: 'List', Icon: FaList }
]

function DiscoveryControls({
  query, onQueryChange, onClearSearch, searchRef, view, onViewChange,
  filtersOpen, onToggleFilters, activeFilterCount, onLocate, locationState, mapIdentity,
  onCompositionStart, onCompositionEnd, locationKnown
}) {
  return (
    <div className={styles.controlDeck}>
      {mapIdentity && (
        <Link href="/places#near-you" className={styles.mapIdentity} aria-label="Back to Explore">
          <FaArrowLeft aria-hidden="true" />
          <span><small>Explore</small><strong>{locationKnown ? 'Near you' : 'Kolkata map'}</strong></span>
        </Link>
      )}
      <label className={styles.searchBox}>
        <span className={styles.srOnly}>Search places or neighbourhoods</span>
        <FaSearch aria-hidden="true" />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
          placeholder="Search places or neighbourhoods…"
          autoComplete="off"
        />
        {query && (
          <button type="button" onClick={onClearSearch} aria-label="Clear search">
            <FaTimes aria-hidden="true" />
          </button>
        )}
      </label>

      <button
        type="button"
        className={styles.filterButton}
        aria-expanded={filtersOpen}
        aria-controls="near-you-filters"
        onClick={onToggleFilters}
      >
        <FaFilter aria-hidden="true" />
        <span>Filters</span>
        {activeFilterCount > 0 && <strong>{activeFilterCount}</strong>}
      </button>

      <div className={styles.viewToggle} role="group" aria-label="Choose results view">
        {viewOptions.map(({ id, label, Icon }) => (
          <button key={id} type="button" aria-pressed={view === id} onClick={() => onViewChange(id)}>
            <Icon aria-hidden="true" /> <span>{label}</span>
          </button>
        ))}
      </div>

      <button type="button" className={styles.locateIcon} onClick={onLocate} disabled={locationState === 'loading'} aria-label={locationState === 'ready' ? 'Location found' : 'Use my location'}>
        <FaCrosshairs aria-hidden="true" />
      </button>
    </div>
  )
}

function FilterScroller({ className, label, children }) {
  return (
    <div className={className} role="group" aria-label={label}>
      {children}
    </div>
  )
}

const PLACE_VISUALS = {
  cafes: { Icon: FaCoffee, label: 'Café' },
  food: { Icon: FaUtensils, label: 'Food' },
  culture: { Icon: FaPalette, label: 'Culture' },
  outdoors: { Icon: FaTree, label: 'Outdoors' },
  shopping: { Icon: FaShoppingBag, label: 'Shopping' },
  experiences: { Icon: FaMap, label: 'Experience' },
  places: { Icon: FaLandmark, label: 'Place' }
}

function PlaceVisual({ place, detail = false }) {
  if (place.hasRealImage && place.image) {
    return (
      <img
        className={styles.placePhoto}
        src={place.image}
        alt={`${place.name} venue photo`}
        width={detail ? 360 : 640}
        height={detail ? 250 : 480}
      />
    )
  }

  const visual = PLACE_VISUALS[place.markerCategory] || PLACE_VISUALS.places
  const Icon = visual.Icon
  return (
    <div className={`${styles.placeVisualFallback} ${styles[`visual_${place.markerCategory || 'places'}`]}`} role="img" aria-label={`Photo not available for ${place.name}`}>
      <Icon aria-hidden="true" />
      <span>{visual.label}</span>
      <small>Photo not available</small>
    </div>
  )
}

function FilterStack({ category, onCategoryChange, area, areas, onAreaChange, resultCount, activeFilterCount, onClearFilters, onClose }) {
  return (
    <div id="near-you-filters" className={styles.filterStack}>
      <div className={styles.filterHeading}>
        <div><span>Refine the map</span><strong>{resultCount} places on this map</strong></div>
        <button type="button" onClick={onClose} aria-label="Close filters"><FaTimes aria-hidden="true" /></button>
      </div>
      <div className={styles.filterGroup}>
        <span>What</span>
        <FilterScroller className={styles.categoryFilters} label="Filter by category">
          {nearCategories.map((item) => (
            <button key={item} type="button" aria-pressed={category === item} onClick={() => onCategoryChange(item)}>
              {item}
            </button>
          ))}
        </FilterScroller>
      </div>
      <div className={styles.filterGroup}>
        <span>Where</span>
        <FilterScroller className={styles.areaFilters} label="Filter by area">
          {areas.map((item) => (
            <button key={item} type="button" aria-pressed={area === item} onClick={() => onAreaChange(item)}>
              {item}
            </button>
          ))}
        </FilterScroller>
      </div>
      {activeFilterCount > 0 && <button type="button" className={styles.clearFilters} onClick={onClearFilters}>Clear all filters</button>}
    </div>
  )
}

function PlaceDetails({ place, onClose, enrichmentStatus, showDistance }) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.coordinates.lat},${place.coordinates.lng}`)}`
  let websiteUrl = null
  let imageSourceUrl = null
  try {
    const parsedWebsite = new URL(place.website)
    if (['http:', 'https:'].includes(parsedWebsite.protocol)) websiteUrl = parsedWebsite.toString()
  } catch {}
  try {
    const parsedSource = new URL(place.imageSourceUrl)
    if (['http:', 'https:'].includes(parsedSource.protocol)) imageSourceUrl = parsedSource.toString()
  } catch {}

  return (
    <aside className={styles.placeDetails} aria-label={`${place.name} details`}>
      <button type="button" className={styles.closeDetails} onClick={onClose} aria-label={`Close ${place.name} details`}>
        <FaTimes aria-hidden="true" />
      </button>
      <PlaceVisual place={place} detail />
      <div className={styles.detailsBody}>
        <div className={styles.detailsMeta}>
          <span>{place.category}</span>
          <strong>{place.rating ? <><FaStar aria-hidden="true" /> {place.rating}</> : 'New'}</strong>
        </div>
        <h2>{place.name}</h2>
        <p className={styles.detailsAddress}><FaMapMarkerAlt aria-hidden="true" /> {place.address}</p>
        <p>{place.description}</p>
        {enrichmentStatus === 'loading' && <p className={styles.enrichmentStatus}>Checking live detailsâ€¦</p>}
        {place.openingHours && <p className={styles.enrichmentStatus}>Opening hours available from Ola Maps</p>}
        {(place.phone || websiteUrl) && (
          <div className={styles.contactLinks}>
            {place.phone && <a href={`tel:${String(place.phone).replace(/[^+\d]/g, '')}`}>Call</a>}
            {websiteUrl && <a href={websiteUrl} target="_blank" rel="noopener noreferrer">Website</a>}
          </div>
        )}
        {place.imageAttribution && (
          <p className={styles.imageCredit}>
            Photo: {imageSourceUrl ? (
              <a href={imageSourceUrl} target="_blank" rel="noopener noreferrer">{place.imageAttribution}</a>
            ) : place.imageAttribution}
            {place.imageLicense ? ` · ${place.imageLicense}` : ''}
          </p>
        )}
        <div className={styles.detailsFooter}>
          {showDistance && place.distance && <strong>{place.distance} away</strong>}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${place.name} in Google Maps`}
          >
            Open in Google Maps <FaExternalLinkAlt aria-hidden="true" />
          </a>
        </div>
      </div>
    </aside>
  )
}

function PlaceCard({ place, layout, onShowMap, showDistance }) {
  return (
    <article className={`${styles.placeCard} ${layout === 'list' ? styles.placeCardList : ''}`}>
      <PlaceVisual place={place} />
      <div className={styles.cardBody}>
        <div className={styles.cardTopline}>
          <span>{place.category}</span>
          <strong>{place.rating ? <><FaStar aria-hidden="true" /> {place.rating}</> : 'New'}</strong>
        </div>
        <h2>{place.name}</h2>
        <p><FaMapMarkerAlt aria-hidden="true" /> {place.address}</p>
        <span>{place.description}</span>
        <div className={styles.cardFooter}>
          {showDistance && place.distance && <strong>{place.distance} away</strong>}
          <button type="button" onClick={() => onShowMap(place.id)}>Show on map</button>
        </div>
      </div>
    </article>
  )
}

function PlaceResultsSkeleton({ layout }) {
  const count = layout === 'grid' ? 6 : 4
  return (
    <section
      className={`${layout === 'grid' ? styles.gridView : styles.listView} ${styles.skeletonResults}`}
      aria-label="Loading fresh Kolkata places"
      role="status"
    >
      <span className={styles.srOnly}>Loading fresh Kolkata places</span>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className={`${styles.placeSkeleton} ${layout === 'list' ? styles.placeSkeletonList : ''}`} aria-hidden="true">
          <div className={styles.placeSkeletonMedia} />
          <div className={styles.placeSkeletonBody}>
            <span />
            <strong />
            <small />
            <small />
            <i />
          </div>
        </div>
      ))}
    </section>
  )
}

export default function NearYou() {
  const router = useRouter()
  const routeInitialized = useRef(false)
  const [view, setView] = useState('map')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [area, setArea] = useState('All areas')
  const [selectedPlaceId, setSelectedPlaceId] = useState(null)
  const [locationState, setLocationState] = useState('idle')
  const [userPosition, setUserPosition] = useState(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [mapMoved, setMapMoved] = useState(false)
  const [pendingBounds, setPendingBounds] = useState(null)
  const [requestBounds, setRequestBounds] = useState(KOLKATA_BOUNDS)
  const [dataPlaces, setDataPlaces] = useState([])
  const [dataStatus, setDataStatus] = useState('loading')
  const [nextCursor, setNextCursor] = useState(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const [requestVersion, setRequestVersion] = useState(0)
  const [placeEnrichment, setPlaceEnrichment] = useState({ placeId: null, status: 'idle', data: null })
  const [isComposing, setIsComposing] = useState(false)
  const [locationRequested, setLocationRequested] = useState(false)
  const searchRef = useRef(null)
  const routeGuideId = Array.isArray(router.query.guide) ? router.query.guide[0] : router.query.guide
  const activeGuide = findExploreGuide(routeGuideId)

  useEffect(() => {
    if (!router.isReady || routeInitialized.current) return
    routeInitialized.current = true
    const routeQuery = Array.isArray(router.query.q) ? router.query.q[0] : router.query.q
    const routeCategory = Array.isArray(router.query.category) ? router.query.category[0] : router.query.category
    const routeView = Array.isArray(router.query.view) ? router.query.view[0] : router.query.view
    const routeLocate = Array.isArray(router.query.locate) ? router.query.locate[0] : router.query.locate
    if (routeQuery) setQuery(routeQuery)
    if (routeCategory && nearCategories.includes(routeCategory)) setCategory(routeCategory)
    if (viewOptions.some((option) => option.id === routeView)) setView(routeView)
    if (routeLocate === '1') setLocationRequested(true)
  }, [router.isReady, router.query])

  const searchedPlaces = useMemo(() => searchNearbyPlaces(dataPlaces, '', 'All', area), [area, dataPlaces])
  const areas = useMemo(() => ['All areas', ...new Set(dataPlaces.map((place) => place.area).filter(Boolean))], [dataPlaces])
  const visiblePlaces = searchedPlaces
  const selectedBasePlace = visiblePlaces.find((place) => place.id === selectedPlaceId) || null
  const selectedPlace = selectedBasePlace && placeEnrichment.placeId === selectedBasePlace.id && placeEnrichment.data
    ? { ...selectedBasePlace, ...placeEnrichment.data, id: selectedBasePlace.id, coordinates: selectedBasePlace.coordinates }
    : selectedBasePlace
  const activeFilterCount = Number(category !== 'All') + Number(area !== 'All areas') + Number(Boolean(query.trim()))
  const fitKey = `${query}|${category}|${area}|${userPosition?.lat || ''}|${userPosition?.lng || ''}`

  const selectPlace = useCallback((placeId) => setSelectedPlaceId(placeId), [])
  const markMapMoved = useCallback((bounds) => {
    setPendingBounds(bounds)
    setMapMoved(true)
  }, [])

  useEffect(() => {
    if (!selectedBasePlace) {
      setPlaceEnrichment({ placeId: null, status: 'idle', data: null })
      return undefined
    }
    const controller = new AbortController()
    setPlaceEnrichment({ placeId: selectedBasePlace.id, status: 'loading', data: null })
    fetchPlaceDetails(selectedBasePlace, { signal: controller.signal })
      .then((data) => setPlaceEnrichment({ placeId: selectedBasePlace.id, status: data ? 'success' : 'unavailable', data }))
      .catch((error) => {
        if (error.name !== 'AbortError') setPlaceEnrichment({ placeId: selectedBasePlace.id, status: 'unavailable', data: null })
      })
    return () => controller.abort()
  }, [selectedBasePlace?.id])

  useEffect(() => {
    const text = query.trim()
    if (isComposing || (text && text.length < 2)) return undefined

    const controller = new AbortController()
    setDataPlaces([])
    setNextCursor(null)
    setSelectedPlaceId(null)
    setDataStatus('loading')
    const timer = window.setTimeout(async () => {
      const origin = userPosition || KOLKATA
      const params = new URLSearchParams()
      if (category !== 'All') params.set('category', category)
      let endpoint
      if (text) {
        endpoint = '/api/explore/search'
        params.set('q', text)
        if (userPosition) {
          params.set('lat', String(origin.lat))
          params.set('lng', String(origin.lng))
        }
        params.set('limit', '50')
      } else {
        endpoint = '/api/explore/map'
        Object.entries(requestBounds).forEach(([key, value]) => params.set(key, String(value)))
        params.set('limit', view === 'map' ? '300' : '30')
      }

      try {
        const result = await fetchLivePlaces(`${endpoint}?${params}`, { signal: controller.signal })
        setDataPlaces(result.places)
        setNextCursor(result.meta.nextCursor || null)
        setDataStatus('success')
      } catch (error) {
        if (error.name === 'AbortError') return
        setDataPlaces([])
        setNextCursor(null)
        setDataStatus('error')
      }
    }, 300)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [category, isComposing, query, requestBounds, requestVersion, userPosition, view])

  useEffect(() => {
    setPendingBounds(null)
    setMapMoved(false)
  }, [area, category, query])

  useEffect(() => {
    if (!filtersOpen) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setFiltersOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [filtersOpen])

  const clearSearch = () => {
    setQuery('')
    setDataPlaces([])
    setDataStatus('loading')
    searchRef.current?.focus()
  }

  const clearFilters = () => {
    setQuery('')
    setCategory('All')
    setArea('All areas')
    setSelectedPlaceId(null)
    setRequestBounds(KOLKATA_BOUNDS)
    setPendingBounds(null)
    setMapMoved(false)
    setFiltersOpen(false)
    searchRef.current?.focus()
  }

  const showOnMap = (placeId) => {
    setSelectedPlaceId(placeId)
    setFiltersOpen(false)
    setMapMoved(false)
    setView('map')
  }

  const changeView = (nextView) => {
    setFiltersOpen(false)
    setDataPlaces([])
    setDataStatus('loading')
    setView(nextView)
  }

  const changeQuery = (nextQuery) => {
    setQuery(nextQuery)
    const text = nextQuery.trim()
    if (!text || text.length >= 2) {
      setDataPlaces([])
      setDataStatus('loading')
    }
  }

  const changeCategory = (nextCategory) => {
    setCategory(nextCategory)
    setDataPlaces([])
    setDataStatus('loading')
  }

  const retryPlaces = () => {
    setDataPlaces([])
    setDataStatus('loading')
    setRequestVersion((version) => version + 1)
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationState('unsupported')
      return
    }

    setLocationState('loading')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setDataPlaces([])
        setDataStatus('loading')
        setUserPosition({ lat: coords.latitude, lng: coords.longitude })
        setRequestBounds({
          west: coords.longitude - 0.045,
          south: coords.latitude - 0.045,
          east: coords.longitude + 0.045,
          north: coords.latitude + 0.045
        })
        setLocationState('ready')
      },
      () => setLocationState('denied'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  useEffect(() => {
    if (!locationRequested) return
    setLocationRequested(false)
    useMyLocation()
  }, [locationRequested])

  return (
    <>
      <Head>
        <title>Near You — MyKolkata</title>
        <meta name="description" content="Explore cafés, food, culture and places on a real Kolkata map." />
      </Head>

      <main className={`${styles.root} ${view === 'map' ? styles.mapMode : styles.resultsMode}`}>
        {view === 'map' ? (
          <section className={styles.mapWorkspace} aria-label="Explore nearby Kolkata places">
            <NearYouMap
              places={visiblePlaces}
              selectedPlaceId={selectedPlace?.id || null}
              onSelect={selectPlace}
              userPosition={userPosition}
              onViewportChange={markMapMoved}
              fitKey={fitKey}
            />

            <div className={styles.mapOverlay}>
              <DiscoveryControls
                query={query}
                onQueryChange={changeQuery}
                onClearSearch={clearSearch}
                searchRef={searchRef}
                view={view}
                onViewChange={changeView}
                filtersOpen={filtersOpen}
                onToggleFilters={() => setFiltersOpen((value) => !value)}
                activeFilterCount={activeFilterCount}
                onLocate={useMyLocation}
                locationState={locationState}
                locationKnown={Boolean(userPosition)}
                mapIdentity
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={(event) => {
                  setIsComposing(false)
                  changeQuery(event.currentTarget.value)
                }}
              />
              {filtersOpen && (
                <FilterStack
                  category={category}
                  onCategoryChange={changeCategory}
                  area={area}
                  areas={areas}
                  onAreaChange={setArea}
                  resultCount={visiblePlaces.length}
                  activeFilterCount={activeFilterCount}
                  onClearFilters={clearFilters}
                  onClose={() => setFiltersOpen(false)}
                />
              )}
            </div>

            <div className={styles.mapStatusBar}>
              <span aria-live="polite">
                {dataStatus === 'loading'
                  ? 'Updating placesâ€¦'
                  : dataStatus === 'error'
                    ? 'Fresh places unavailable'
                    : <><strong>{visiblePlaces.length}</strong> places <small>· {userPosition ? 'near your location' : 'around Kolkata'}</small></>}
              </span>
              {mapMoved && (
                <button
                  type="button"
                  onClick={() => {
                    setDataPlaces([])
                    setDataStatus('loading')
                    if (pendingBounds) setRequestBounds(pendingBounds)
                    setSelectedPlaceId(null)
                    setMapMoved(false)
                  }}
                >
                  Search this area
                </button>
              )}
            </div>

            {(locationState === 'denied' || locationState === 'unsupported') && (
              <p className={styles.locationNotice} role="status">
                {locationState === 'denied'
                  ? 'Location access was not available. You can still search and filter Kolkata manually.'
                  : 'This browser does not support location access.'}
              </p>
            )}
            {dataStatus === 'error' && (
              <div className={styles.dataNotice} role="status">
                <span>Fresh places couldn’t be loaded.</span>
                <button type="button" onClick={retryPlaces}>Try again</button>
              </div>
            )}

            {selectedPlace && <PlaceDetails place={selectedPlace} showDistance={Boolean(userPosition)} enrichmentStatus={placeEnrichment.status} onClose={() => setSelectedPlaceId(null)} />}
            {dataStatus === 'success' && !visiblePlaces.length && (
              <div className={styles.emptyState}>
                <strong>No Kolkata stops match that search.</strong>
                <span>Try a different neighbourhood or clear the filters.</span>
                <button type="button" onClick={clearFilters}>Show all places</button>
              </div>
            )}
          </section>
        ) : (
          <>
            <header className={styles.resultsHeader}>
              <div className={styles.titleBlock}>
                <Link href="/places#near-you" className={styles.backLink}><FaArrowLeft aria-hidden="true" /> Explore</Link>
                <p>{activeGuide ? 'Curated Kolkata guide' : userPosition ? 'Based on your location' : 'Browse the city'}</p>
                <h1>{activeGuide?.name || (userPosition ? 'Near You' : 'Explore Kolkata')}</h1>
              </div>
            </header>
            <section className={styles.explorer} aria-label="Explore nearby Kolkata places">
              <DiscoveryControls
                query={query}
                onQueryChange={changeQuery}
                onClearSearch={clearSearch}
                searchRef={searchRef}
                view={view}
                onViewChange={changeView}
                filtersOpen={filtersOpen}
                onToggleFilters={() => setFiltersOpen((value) => !value)}
                activeFilterCount={activeFilterCount}
                onLocate={useMyLocation}
                locationState={locationState}
                locationKnown={Boolean(userPosition)}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={(event) => {
                  setIsComposing(false)
                  changeQuery(event.currentTarget.value)
                }}
              />
              {filtersOpen && (
                <FilterStack
                  category={category}
                  onCategoryChange={changeCategory}
                  area={area}
                  areas={areas}
                  onAreaChange={setArea}
                  resultCount={visiblePlaces.length}
                  activeFilterCount={activeFilterCount}
                  onClearFilters={clearFilters}
                  onClose={() => setFiltersOpen(false)}
                />
              )}

              <div className={styles.resultsSummary} aria-live="polite">
                {dataStatus === 'loading'
                  ? 'Updating live placesâ€¦'
                  : dataStatus === 'error'
                    ? 'Fresh places are temporarily unavailable.'
                    : <><strong>{visiblePlaces.length}</strong> places to explore {userPosition ? 'near your location' : 'around Kolkata'} · data from Overture Maps Foundation</>}
              </div>

              {activeGuide?.description && <p className={styles.guideIntro}>{activeGuide.description}</p>}

              {locationState === 'denied' && <p className={styles.resultsNotice} role="status">Location access was not available. You can still search and filter Kolkata manually.</p>}
              {locationState === 'unsupported' && <p className={styles.resultsNotice} role="status">This browser does not support location access.</p>}
              {dataStatus === 'loading' ? (
                <PlaceResultsSkeleton layout={view} />
              ) : dataStatus === 'error' ? (
                <div className={`${styles.emptyState} ${styles.emptyPage}`} role="status">
                  <strong>We couldn’t load fresh Kolkata places.</strong>
                  <span>Check your connection and try again.</span>
                  <button type="button" onClick={retryPlaces}>Try again</button>
                </div>
              ) : visiblePlaces.length ? (
                <>
                  <section className={view === 'grid' ? styles.gridView : styles.listView} aria-label={`Nearby places ${view}`}>
                    {visiblePlaces.map((place) => <PlaceCard key={place.id} place={place} layout={view} showDistance={Boolean(userPosition)} onShowMap={showOnMap} />)}
                  </section>
                  {nextCursor && (
                    <button
                      type="button"
                      className={styles.loadMore}
                      disabled={loadingMore}
                      onClick={async () => {
                        setLoadingMore(true)
                        try {
                          const text = query.trim()
                          const params = new URLSearchParams({ cursor: nextCursor, limit: '30' })
                          if (category !== 'All') params.set('category', category)
                          let endpoint = '/api/explore/map'
                          if (text) {
                            endpoint = '/api/explore/search'
                            params.set('q', text)
                          } else {
                            Object.entries(requestBounds).forEach(([key, value]) => params.set(key, String(value)))
                          }
                          const result = await fetchLivePlaces(`${endpoint}?${params}`)
                          setDataPlaces((current) => [...current, ...result.places.filter((place) => !current.some((item) => item.id === place.id))])
                          setNextCursor(result.meta.nextCursor || null)
                        } finally {
                          setLoadingMore(false)
                        }
                      }}
                    >
                      {loadingMore ? 'Loading more…' : 'Load more places'}
                    </button>
                  )}
                </>
              ) : (
                <div className={`${styles.emptyState} ${styles.emptyPage}`}>
                  <strong>No Kolkata stops match that search.</strong>
                  <span>Try a different neighbourhood or clear the filters.</span>
                  <button type="button" onClick={clearFilters}>Show all places</button>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  )
}
