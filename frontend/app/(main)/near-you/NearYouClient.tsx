// @ts-nocheck
'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import NearYouMap from '@/components/explore/NearYouMap'
import { findExploreGuide, searchNearbyPlaces } from '@/lib/exploreData'
import { fetchLivePlaces, fetchPlaceDetails } from '@/lib/livePlaces'
import { Sprig } from '@/components/brand/kolka'
import { CityIcon, UiIcon } from '@/components/brand/icons'
import { AlponaLoader } from '@/components/brand/Alpona'
import styles from '@/styles/NearYou.module.css'

const nearCategories = ['All', 'Cafés', 'Food', 'Culture', 'Outdoors', 'Shopping', 'Experiences']
const KOLKATA = { lat: 22.5726, lng: 88.3639 }
const KOLKATA_BOUNDS = { west: 88.32, south: 22.52, east: 88.42, north: 22.62 }

const viewOptions = [
  { id: 'map', label: 'Map' },
  { id: 'grid', label: 'Grid' },
  { id: 'list', label: 'List' }
]

const VIEW_ICONS = { map: 'howrah', grid: 'grid', list: 'list' }

function DiscoveryControls({
  query, onQueryChange, onClearSearch, searchRef, view, onViewChange,
  filtersOpen, onToggleFilters, activeFilterCount, onLocate, locationState, mapIdentity,
  onCompositionStart, onCompositionEnd, locationKnown
}) {
  return (
    <div className={styles.controlDeck}>
      {mapIdentity && (
        <Link href="/places#near-you" className={styles.mapIdentity} aria-label="Back to Explore">
          <UiIcon name="back" />
          <span className={styles.mapIdentityText}>
            <span className="mk-meta">Explore</span>
            <span className={styles.mapIdentityTitle}>{locationKnown ? 'Near you' : 'Kolkata map'}</span>
          </span>
        </Link>
      )}
      <label className={`mk-line ${styles.searchBox}`}>
        <span className="sr-only">Search places or neighbourhoods</span>
        <UiIcon name="search" />
        <input
          ref={searchRef}
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
          placeholder="Search a place or a neighbourhood"
          autoComplete="off"
        />
        {query && (
          <button type="button" className="mk-icon-btn mk-icon-btn--bare" onClick={onClearSearch} aria-label="Clear search">
            <UiIcon name="close" />
          </button>
        )}
      </label>

      <button
        type="button"
        className={`mk-btn mk-btn--secondary mk-btn--sm ${styles.filterButton}`}
        aria-expanded={filtersOpen}
        aria-controls="near-you-filters"
        onClick={onToggleFilters}
      >
        <UiIcon name="filter" />
        <span>Filters</span>
        {activeFilterCount > 0 && <span className={styles.filterCount}>{activeFilterCount}</span>}
      </button>

      <div className={`mk-seg ${styles.viewToggle}`} role="group" aria-label="Choose results view">
        {viewOptions.map(({ id, label }) => (
          <button key={id} type="button" aria-pressed={view === id} onClick={() => onViewChange(id)}>
            {id === 'map' ? <CityIcon name="howrah" size={18} /> : <UiIcon name={VIEW_ICONS[id]} size={16} />}
            <span>{label}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        className={`mk-icon-btn ${styles.locateIcon}`}
        onClick={onLocate}
        disabled={locationState === 'loading'}
        aria-label={locationState === 'ready' ? 'Location found' : 'Use my location'}
      >
        <UiIcon name="locate" size={20} />
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
  cafes: { icon: 'bhaar', label: 'Café' },
  food: { icon: 'phuchka', label: 'Food' },
  culture: { icon: 'book', label: 'Culture' },
  outdoors: { icon: 'boat', label: 'Outdoors' },
  shopping: { icon: 'signboard', label: 'Shopping' },
  experiences: { icon: 'rickshaw', label: 'Experience' },
  places: { icon: 'victoria', label: 'Place' }
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
  return (
    <div className={styles.placeVisualFallback} role="img" aria-label={`Photo not available for ${place.name}`}>
      <CityIcon name={visual.icon} size={36} />
      <span className="mk-meta">{visual.label}</span>
    </div>
  )
}

function FilterStack({ category, onCategoryChange, area, areas, onAreaChange, resultCount, activeFilterCount, onClearFilters, onClose }) {
  return (
    <div id="near-you-filters" className={styles.filterStack}>
      <div className={styles.filterHeading}>
        <div>
          <p className="mk-meta">Refine the map</p>
          <p className={styles.filterTitle}>{resultCount} places on this map</p>
        </div>
        <button type="button" className="mk-icon-btn mk-icon-btn--bare" onClick={onClose} aria-label="Close filters"><UiIcon name="close" /></button>
      </div>
      <div className={styles.filterGroup}>
        <span className="mk-meta">What</span>
        <FilterScroller className={styles.categoryFilters} label="Filter by category">
          {nearCategories.map((item) => (
            <button key={item} type="button" className="mk-chip" aria-pressed={category === item} onClick={() => onCategoryChange(item)}>
              {item}
            </button>
          ))}
        </FilterScroller>
      </div>
      <div className={styles.filterGroup}>
        <span className="mk-meta">Where</span>
        <FilterScroller className={styles.areaFilters} label="Filter by area">
          {areas.map((item) => (
            <button key={item} type="button" className="mk-chip" aria-pressed={area === item} onClick={() => onAreaChange(item)}>
              {item}
            </button>
          ))}
        </FilterScroller>
      </div>
      {activeFilterCount > 0 && <button type="button" className={`mk-btn mk-btn--text ${styles.clearFilters}`} onClick={onClearFilters}>Clear all filters</button>}
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
      <button type="button" className={`mk-icon-btn ${styles.closeDetails}`} onClick={onClose} aria-label={`Close ${place.name} details`}>
        <UiIcon name="close" />
      </button>
      <div className={styles.detailsMedia}><PlaceVisual place={place} detail /></div>
      <div className={styles.detailsBody}>
        <p className={styles.detailsMeta}>
          <span>{place.category}</span>
          <span>{place.rating ? `Rated ${place.rating}` : 'Just added'}</span>
        </p>
        <h2 className={styles.detailsTitle}>{place.name}</h2>
        <p className={styles.detailsAddress}>{place.address}</p>
        {place.description && <p className={styles.detailsDesc}>{place.description}</p>}
        {enrichmentStatus === 'loading' && <p className={styles.enrichmentStatus}>Checking live details…</p>}
        {place.openingHours && <p className={styles.enrichmentStatus}>Opening hours available from Ola Maps</p>}
        {(place.phone || websiteUrl) && (
          <div className={styles.contactLinks}>
            {place.phone && <a className="mk-btn mk-btn--secondary mk-btn--sm" href={`tel:${String(place.phone).replace(/[^+\d]/g, '')}`}>Call</a>}
            {websiteUrl && <a className="mk-btn mk-btn--secondary mk-btn--sm" href={websiteUrl} target="_blank" rel="noopener noreferrer">Website</a>}
          </div>
        )}
        {place.imageAttribution && (
          <p className={styles.imageCredit}>
            Photo by {imageSourceUrl ? (
              <a href={imageSourceUrl} target="_blank" rel="noopener noreferrer">{place.imageAttribution}</a>
            ) : place.imageAttribution}
            {place.imageLicense ? `, ${place.imageLicense}` : ''}
          </p>
        )}
        <div className={styles.detailsFooter}>
          {showDistance && place.distance && <span className={styles.distance}>{place.distance} away</span>}
          <a
            className="mk-btn mk-btn--text"
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${place.name} in Google Maps`}
          >
            Open in Google Maps
          </a>
        </div>
      </div>
    </aside>
  )
}

function PlaceCard({ place, layout, onShowMap, showDistance }) {
  return (
    <article className={`${styles.placeCard} ${layout === 'list' ? styles.placeCardList : ''}`}>
      <div className={styles.cardMedia}><PlaceVisual place={place} /></div>
      <div className={styles.cardBody}>
        <div className={styles.cardHead}>
          <Sprig size={22} />
          <div className={styles.cardHeadText}>
            <h2 className={styles.cardTitle}>{place.name}</h2>
            <p className={styles.cardSub}>{place.category}{place.rating ? `, rated ${place.rating}` : ''}</p>
          </div>
        </div>
        <p className={styles.cardAddress}>{place.address}</p>
        {place.description && <p className={styles.cardDesc}>{place.description}</p>}
        <div className={styles.cardFooter}>
          {showDistance && place.distance && <span className={styles.distance}>{place.distance} away</span>}
          <button type="button" className="mk-btn mk-btn--text" onClick={() => onShowMap(place.id)}>Show on map</button>
        </div>
      </div>
    </article>
  )
}

function PlaceResultsSkeleton({ layout }) {
  const count = layout === 'grid' ? 6 : 4
  return (
    <section className={styles.skeletonResults} aria-label="Loading fresh Kolkata places" role="status">
      <AlponaLoader label="Loading fresh Kolkata places" className={styles.loader} />
      <div className={layout === 'grid' ? styles.gridView : styles.listView}>
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className={`${styles.placeSkeleton} ${layout === 'list' ? styles.placeSkeletonList : ''}`} aria-hidden="true">
            <div className={`mk-skel ${styles.placeSkeletonMedia}`} />
            <div className={styles.placeSkeletonBody}>
              <span className="mk-skel-line" style={{ width: '62%', height: 18 }} />
              <span className="mk-skel-line" style={{ width: '40%' }} />
              <span className="mk-skel-line" style={{ width: '84%' }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function NearYouClient() {
  const searchParams = useSearchParams()
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
  useEffect(() => {
    if (routeInitialized.current) return
    routeInitialized.current = true
    const routeQuery = searchParams.get('q')
    const routeCategory = searchParams.get('category')
    const routeView = searchParams.get('view')
    const routeLocate = searchParams.get('locate')
    if (routeQuery) setQuery(routeQuery)
    if (routeCategory && nearCategories.includes(routeCategory)) setCategory(routeCategory)
    if (viewOptions.some((option) => option.id === routeView)) setView(routeView)
    if (routeLocate === '1') setLocationRequested(true)
  }, [searchParams])

  const routeGuideId = searchParams.get('guide')
  const activeGuide = findExploreGuide(routeGuideId)
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

  const locationMessage = locationState === 'denied'
    ? 'Location access wasn’t available. Search or filter the city by hand instead.'
    : 'This browser can’t share its location. Search or filter the city by hand instead.'

  return (
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
            <span className={styles.statusPill} aria-live="polite">
              {dataStatus === 'loading'
                ? 'Updating places…'
                : dataStatus === 'error'
                  ? 'Fresh places unavailable'
                  : <><span className="mk-tabular">{visiblePlaces.length}</span>&nbsp;places {userPosition ? 'near your location' : 'around Kolkata'}</>}
            </span>
            {mapMoved && (
              <button
                type="button"
                className="mk-btn mk-btn--primary mk-btn--sm"
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
            <p className={styles.locationNotice} role="status">{locationMessage}</p>
          )}
          {dataStatus === 'error' && (
            <div className={styles.dataNotice} role="status">
              <span>Fresh places couldn’t be loaded.</span>
              <button type="button" className="mk-btn mk-btn--secondary mk-btn--sm" onClick={retryPlaces}>Try again</button>
            </div>
          )}

          {selectedPlace && <PlaceDetails place={selectedPlace} showDistance={Boolean(userPosition)} enrichmentStatus={placeEnrichment.status} onClose={() => setSelectedPlaceId(null)} />}
          {dataStatus === 'success' && !visiblePlaces.length && (
            <div className={styles.emptyState}>
              <h2 className="mk-h3">No Kolkata stops match that search.</h2>
              <p className="mk-caption">Try a different neighbourhood, or clear the filters.</p>
              <button type="button" className="mk-btn mk-btn--secondary mk-btn--sm" onClick={clearFilters}>Show all places</button>
            </div>
          )}
        </section>
      ) : (
        <div className="mk-wrap">
          <header className={styles.resultsHeader}>
            <Link href="/places#near-you" className={`mk-btn mk-btn--text ${styles.backLink}`}>
              <UiIcon name="back" /> Explore
            </Link>
            <div className="mk-band-head">
              <Sprig size={46} />
              <div>
                <p className="mk-caption">{activeGuide ? 'A Kolkata guide' : userPosition ? 'Based on your location' : 'Browse the city'}</p>
                <h1 className="mk-h1">{activeGuide?.name || (userPosition ? 'Near You' : 'Explore Kolkata')}</h1>
              </div>
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

            <p className={styles.resultsSummary} aria-live="polite">
              {dataStatus === 'loading'
                ? 'Updating live places…'
                : dataStatus === 'error'
                  ? 'Fresh places are unavailable for now.'
                  : <><span className={styles.summaryCount}>{visiblePlaces.length}</span> places to explore {userPosition ? 'near your location' : 'around Kolkata'}. Data from the Overture Maps Foundation.</>}
            </p>

            {activeGuide?.description && <p className={styles.guideIntro}>{activeGuide.description}</p>}

            {(locationState === 'denied' || locationState === 'unsupported') && <p className={`mk-note ${styles.resultsNotice}`} role="status">{locationMessage}</p>}
            {dataStatus === 'loading' ? (
              <PlaceResultsSkeleton layout={view} />
            ) : dataStatus === 'error' ? (
              <div className={`mk-panel mk-empty ${styles.emptyPage}`} role="status">
                <h2 className="mk-h3">We couldn’t load fresh Kolkata places.</h2>
                <p className="mk-body">Check your connection, then try again.</p>
                <button type="button" className="mk-btn mk-btn--secondary" onClick={retryPlaces}>Try again</button>
              </div>
            ) : visiblePlaces.length ? (
              <>
                <section className={view === 'grid' ? styles.gridView : styles.listView} aria-label={`Nearby places ${view}`}>
                  {visiblePlaces.map((place) => <PlaceCard key={place.id} place={place} layout={view} showDistance={Boolean(userPosition)} onShowMap={showOnMap} />)}
                </section>
                {nextCursor && (
                  <button
                    type="button"
                    className={`mk-btn mk-btn--secondary ${styles.loadMore}`}
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
              <div className={`mk-panel mk-empty ${styles.emptyPage}`}>
                <h2 className="mk-h3">No Kolkata stops match that search.</h2>
                <p className="mk-body">Try a different neighbourhood, or clear the filters.</p>
                <button type="button" className="mk-btn mk-btn--secondary" onClick={clearFilters}>Show all places</button>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
