import Head from 'next/head'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FaArrowLeft, FaCrosshairs, FaExternalLinkAlt, FaFilter, FaList, FaMap,
  FaMapMarkerAlt, FaSearch, FaStar, FaThLarge, FaTimes
} from 'react-icons/fa'
import NearYouMap from '../components/NearYouMap'
import { nearbyPlaces, searchNearbyPlaces } from '../lib/exploreData'
import styles from '../styles/NearYou.module.css'

const nearCategories = ['All', 'Cafés', 'Food', 'Culture', 'Outdoors', 'Shopping']
const areas = ['All areas', ...new Set(nearbyPlaces.map((place) => place.area))]

const viewOptions = [
  { id: 'map', label: 'Map', Icon: FaMap },
  { id: 'grid', label: 'Grid', Icon: FaThLarge },
  { id: 'list', label: 'List', Icon: FaList }
]

function DiscoveryControls({
  query, onQueryChange, onClearSearch, searchRef, view, onViewChange,
  filtersOpen, onToggleFilters, activeFilterCount, onLocate, locationState, mapIdentity
}) {
  return (
    <div className={styles.controlDeck}>
      {mapIdentity && (
        <Link href="/places#near-you" className={styles.mapIdentity} aria-label="Back to Explore">
          <FaArrowLeft aria-hidden="true" />
          <span><small>Explore</small><strong>Near you</strong></span>
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
  const dragRef = useRef(null)

  const finishDrag = (event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <div
      className={className}
      role="group"
      aria-label={label}
      onPointerDown={(event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return
        dragRef.current = {
          pointerId: event.pointerId,
          startX: event.clientX,
          scrollLeft: event.currentTarget.scrollLeft,
          moved: false
        }
        event.currentTarget.setPointerCapture?.(event.pointerId)
      }}
      onPointerMove={(event) => {
        const drag = dragRef.current
        if (!drag || drag.pointerId !== event.pointerId) return
        const distance = event.clientX - drag.startX
        if (Math.abs(distance) > 4) drag.moved = true
        if (!drag.moved) return
        event.preventDefault()
        event.currentTarget.scrollLeft = drag.scrollLeft - distance
      }}
      onPointerUp={finishDrag}
      onPointerCancel={() => { dragRef.current = null }}
      onClickCapture={(event) => {
        if (dragRef.current?.moved) {
          event.preventDefault()
          event.stopPropagation()
        }
        dragRef.current = null
      }}
    >
      {children}
    </div>
  )
}

function FilterStack({ category, onCategoryChange, area, onAreaChange, resultCount, activeFilterCount, onClearFilters, onClose }) {
  return (
    <div id="near-you-filters" className={styles.filterStack}>
      <div className={styles.filterHeading}>
        <div><span>Refine the map</span><strong>{resultCount} places nearby</strong></div>
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

function PlaceDetails({ place, onClose }) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.coordinates.lat},${place.coordinates.lng}`)}`

  return (
    <aside className={styles.placeDetails} aria-label={`${place.name} details`}>
      <button type="button" className={styles.closeDetails} onClick={onClose} aria-label={`Close ${place.name} details`}>
        <FaTimes aria-hidden="true" />
      </button>
      <img src={place.image} alt="" width="360" height="250" />
      <div className={styles.detailsBody}>
        <div className={styles.detailsMeta}>
          <span>{place.category}</span>
          <strong><FaStar aria-hidden="true" /> {place.rating}</strong>
        </div>
        <h2>{place.name}</h2>
        <p className={styles.detailsAddress}><FaMapMarkerAlt aria-hidden="true" /> {place.address}</p>
        <p>{place.description}</p>
        <div className={styles.detailsFooter}>
          <strong>{place.distance} away</strong>
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

function PlaceCard({ place, layout, onShowMap }) {
  return (
    <article className={`${styles.placeCard} ${layout === 'list' ? styles.placeCardList : ''}`}>
      <img src={place.image} alt="" width="640" height="480" />
      <div className={styles.cardBody}>
        <div className={styles.cardTopline}>
          <span>{place.category}</span>
          <strong><FaStar aria-hidden="true" /> {place.rating}</strong>
        </div>
        <h2>{place.name}</h2>
        <p><FaMapMarkerAlt aria-hidden="true" /> {place.address}</p>
        <span>{place.description}</span>
        <div className={styles.cardFooter}>
          <strong>{place.distance} away</strong>
          <button type="button" onClick={() => onShowMap(place.id)}>Show on map</button>
        </div>
      </div>
    </article>
  )
}

export default function NearYou() {
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
  const [viewportBounds, setViewportBounds] = useState(null)
  const searchRef = useRef(null)

  const searchedPlaces = useMemo(
    () => searchNearbyPlaces(nearbyPlaces, query, category, area),
    [area, category, query]
  )
  const visiblePlaces = useMemo(() => {
    if (!viewportBounds) return searchedPlaces
    return searchedPlaces.filter(({ coordinates }) => (
      coordinates.lat <= viewportBounds.north &&
      coordinates.lat >= viewportBounds.south &&
      coordinates.lng <= viewportBounds.east &&
      coordinates.lng >= viewportBounds.west
    ))
  }, [searchedPlaces, viewportBounds])
  const selectedPlace = visiblePlaces.find((place) => place.id === selectedPlaceId) || null
  const activeFilterCount = Number(category !== 'All') + Number(area !== 'All areas') + Number(Boolean(query.trim()))
  const fitKey = `${query}|${category}|${area}`

  const selectPlace = useCallback((placeId) => setSelectedPlaceId(placeId), [])
  const markMapMoved = useCallback((bounds) => {
    setPendingBounds(bounds)
    setMapMoved(true)
  }, [])

  useEffect(() => {
    setViewportBounds(null)
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
    searchRef.current?.focus()
  }

  const clearFilters = () => {
    setQuery('')
    setCategory('All')
    setArea('All areas')
    setSelectedPlaceId(null)
    setViewportBounds(null)
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
    setView(nextView)
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationState('unsupported')
      return
    }

    setLocationState('loading')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserPosition({ lat: coords.latitude, lng: coords.longitude })
        setLocationState('ready')
      },
      () => setLocationState('denied'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

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
                onQueryChange={setQuery}
                onClearSearch={clearSearch}
                searchRef={searchRef}
                view={view}
                onViewChange={changeView}
                filtersOpen={filtersOpen}
                onToggleFilters={() => setFiltersOpen((value) => !value)}
                activeFilterCount={activeFilterCount}
                onLocate={useMyLocation}
                locationState={locationState}
                mapIdentity
              />
              {filtersOpen && (
                <FilterStack
                  category={category}
                  onCategoryChange={setCategory}
                  area={area}
                  onAreaChange={setArea}
                  resultCount={visiblePlaces.length}
                  activeFilterCount={activeFilterCount}
                  onClearFilters={clearFilters}
                  onClose={() => setFiltersOpen(false)}
                />
              )}
            </div>

            <div className={styles.mapStatusBar}>
              <span aria-live="polite"><strong>{visiblePlaces.length}</strong> places</span>
              {mapMoved && (
                <button
                  type="button"
                  onClick={() => {
                    setViewportBounds(pendingBounds)
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

            {selectedPlace && <PlaceDetails place={selectedPlace} onClose={() => setSelectedPlaceId(null)} />}
            {!visiblePlaces.length && (
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
                <p>Places around Kolkata</p>
                <h1>Near You</h1>
              </div>
            </header>
            <section className={styles.explorer} aria-label="Explore nearby Kolkata places">
              <DiscoveryControls
                query={query}
                onQueryChange={setQuery}
                onClearSearch={clearSearch}
                searchRef={searchRef}
                view={view}
                onViewChange={changeView}
                filtersOpen={filtersOpen}
                onToggleFilters={() => setFiltersOpen((value) => !value)}
                activeFilterCount={activeFilterCount}
                onLocate={useMyLocation}
                locationState={locationState}
              />
              {filtersOpen && (
                <FilterStack
                  category={category}
                  onCategoryChange={setCategory}
                  area={area}
                  onAreaChange={setArea}
                  resultCount={visiblePlaces.length}
                  activeFilterCount={activeFilterCount}
                  onClearFilters={clearFilters}
                  onClose={() => setFiltersOpen(false)}
                />
              )}

              <div className={styles.resultsSummary}><strong>{visiblePlaces.length}</strong> places to explore</div>

              {locationState === 'denied' && <p className={styles.resultsNotice} role="status">Location access was not available. You can still search and filter Kolkata manually.</p>}
              {locationState === 'unsupported' && <p className={styles.resultsNotice} role="status">This browser does not support location access.</p>}

              {visiblePlaces.length ? (
                <section className={view === 'grid' ? styles.gridView : styles.listView} aria-label={`Nearby places ${view}`}>
                  {visiblePlaces.map((place) => <PlaceCard key={place.id} place={place} layout={view} onShowMap={showOnMap} />)}
                </section>
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
