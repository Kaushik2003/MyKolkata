import { useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import styles from '../styles/NearYou.module.css'

const KOLKATA_CENTER = [88.3518, 22.5547]
const MAP_STYLES = {
  light: 'https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?app=mykolkata-v1',
  dark: 'https://api.olamaps.io/tiles/vector/v1/styles/default-dark-standard/style.json?app=mykolkata-v1'
}
const SOURCE_ID = 'mykolkata-places'
const CLUSTER_LAYER_ID = 'mykolkata-place-clusters'
const CLUSTER_COUNT_LAYER_ID = 'mykolkata-place-cluster-count'
const SELECTED_LAYER_ID = 'mykolkata-selected-place'
const PLACE_PHOTO_LAYER_ID = 'mykolkata-place-photos'

function safeErrorMessage(error) {
  const message = error instanceof Error ? error.message : String(error || 'Unknown Ola Maps error')
  return message.replace(/([?&]api_key=)[^&\s]+/gi, '$1[redacted]')
}

const CATEGORY_MARKERS = {
  cafes: { color: '#d8543d', label: 'C' },
  food: { color: '#f5c344', label: 'F' },
  places: { color: '#3157e5', label: 'P' },
  culture: { color: '#7946a8', label: 'A' },
  shopping: { color: '#24765f', label: 'S' },
  experiences: { color: '#e94b35', label: 'E' },
  outdoors: { color: '#238d84', label: 'O' }
}

function imageIdFor(place) {
  return place.hasRealImage ? `mykolkata-photo-${place.id}` : `mykolkata-category-${place.markerCategory || 'places'}`
}

function placesGeoJson(places, selectedPlaceId) {
  return {
    type: 'FeatureCollection',
    features: places.map((place) => ({
      type: 'Feature',
      id: place.id,
      properties: {
        id: place.id,
        name: place.name,
        category: place.category,
        imageId: imageIdFor(place),
        selected: place.id === selectedPlaceId
      },
      geometry: {
        type: 'Point',
        coordinates: [place.coordinates.lng, place.coordinates.lat]
      }
    }))
  }
}

function createPhotoImage(source, category = 'places', hasRealImage = true) {
  return new Promise((resolve) => {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    const image = new Image()

    const finish = (hasImage) => {
      context.clearRect(0, 0, size, size)
      context.save()
      context.shadowColor = 'rgba(20, 32, 51, .32)'
      context.shadowBlur = 7
      context.shadowOffsetY = 4
      context.fillStyle = '#ffffff'
      context.beginPath()
      context.arc(32, 32, 29, 0, Math.PI * 2)
      context.fill()
      context.restore()

      context.save()
      context.beginPath()
      context.arc(32, 32, 25, 0, Math.PI * 2)
      context.clip()
      if (hasImage && hasRealImage) {
        const scale = Math.max(50 / image.naturalWidth, 50 / image.naturalHeight)
        const width = image.naturalWidth * scale
        const height = image.naturalHeight * scale
        context.drawImage(image, 32 - width / 2, 32 - height / 2, width, height)
      } else {
        const marker = CATEGORY_MARKERS[category] || CATEGORY_MARKERS.places
        context.fillStyle = marker.color
        context.fillRect(7, 5, 50, 50)
        context.fillStyle = '#ffffff'
        context.font = '700 22px Manrope, sans-serif'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText(marker.label, 32, 31)
      }
      context.restore()
      resolve(context.getImageData(0, 0, size, size))
    }

    if (hasRealImage && source) {
      image.onload = () => finish(true)
      image.onerror = () => finish(false)
      image.decoding = 'async'
      image.src = source
    } else {
      finish(false)
    }
  })
}

async function ensurePhotoImages(map, places, registeredImageIds) {
  await Promise.all(places.map(async (place) => {
    const imageId = imageIdFor(place)
    if (map.hasImage(imageId)) {
      registeredImageIds.add(imageId)
      return
    }
    const imageData = await createPhotoImage(place.image, place.markerCategory, place.hasRealImage)
    if (!map.hasImage(imageId)) map.addImage(imageId, imageData)
    registeredImageIds.add(imageId)
  }))
}

function addPlaceLayers(map) {
  if (!map.getSource(SOURCE_ID)) {
    map.addSource(SOURCE_ID, {
      type: 'geojson',
      data: placesGeoJson([], null),
      cluster: true,
      clusterMaxZoom: 17,
      clusterRadius: 58
    })
  }

  if (!map.getLayer(CLUSTER_LAYER_ID)) map.addLayer({
    id: CLUSTER_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': '#f5c344',
      'circle-radius': ['step', ['get', 'point_count'], 25, 10, 30, 25, 35],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 4
    }
  })

  if (!map.getLayer(CLUSTER_COUNT_LAYER_ID)) map.addLayer({
    id: CLUSTER_COUNT_LAYER_ID,
    type: 'symbol',
    source: SOURCE_ID,
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-size': 13,
      'text-allow-overlap': true
    },
    paint: { 'text-color': '#142033' }
  })

  if (!map.getLayer(SELECTED_LAYER_ID)) map.addLayer({
    id: SELECTED_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'selected'], true]],
    paint: {
      'circle-color': '#f5c344',
      'circle-radius': 30,
      'circle-stroke-color': '#142033',
      'circle-stroke-width': 2
    }
  })

  if (!map.getLayer(PLACE_PHOTO_LAYER_ID)) map.addLayer({
    id: PLACE_PHOTO_LAYER_ID,
    type: 'symbol',
    source: SOURCE_ID,
    filter: ['!', ['has', 'point_count']],
    layout: {
      'icon-image': ['get', 'imageId'],
      'icon-size': .86,
      'icon-allow-overlap': true,
      'icon-ignore-placement': true
    }
  })

  ;[
    CLUSTER_LAYER_ID,
    CLUSTER_COUNT_LAYER_ID,
    SELECTED_LAYER_ID,
    PLACE_PHOTO_LAYER_ID
  ].forEach((layerId) => map.moveLayer(layerId))
}

function placeBounds(places) {
  const lngs = places.map((place) => place.coordinates.lng)
  const lats = places.map((place) => place.coordinates.lat)
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)]
  ]
}

async function restorePlaceLayers(map, places, selectedPlaceId, registeredImageIds) {
  addPlaceLayers(map)
  await ensurePhotoImages(map, places, registeredImageIds)
  map.getSource(SOURCE_ID)?.setData(placesGeoJson(places, selectedPlaceId))
}

export default function NearYouMap({ places, selectedPlaceId, onSelect, userPosition, onViewportChange, fitKey }) {
  const { darkMode } = useTheme()
  const elementRef = useRef(null)
  const mapRef = useRef(null)
  const olaMapsRef = useRef(null)
  const userMarkerRef = useRef(null)
  const registeredImageIdsRef = useRef(new Set())
  const previousFitKeyRef = useRef('')
  const userInteractingRef = useRef(false)
  const savedCameraRef = useRef(null)
  const latestPlacesRef = useRef(places)
  const latestSelectedIdRef = useRef(selectedPlaceId)
  const onSelectRef = useRef(onSelect)
  const onViewportChangeRef = useRef(onViewportChange)
  const desiredStyleRef = useRef(darkMode ? MAP_STYLES.dark : MAP_STYLES.light)
  const activeStyleRef = useRef(null)
  const styleChangingRef = useRef(false)
  const styleSwitchVersionRef = useRef(0)
  const syncVersionRef = useRef(0)
  const [attempt, setAttempt] = useState(0)
  const [status, setStatus] = useState('loading')
  const [isStyleChanging, setIsStyleChanging] = useState(false)
  const placeKey = useMemo(() => places.map((place) => place.id).join('|'), [places])

  latestPlacesRef.current = places
  latestSelectedIdRef.current = selectedPlaceId
  onSelectRef.current = onSelect
  onViewportChangeRef.current = onViewportChange
  desiredStyleRef.current = darkMode ? MAP_STYLES.dark : MAP_STYLES.light

  useEffect(() => {
    let cancelled = false
    let map
    let loadTimer
    const apiKey = process.env.NEXT_PUBLIC_OLA_MAPS_API_KEY

    if (!apiKey) {
      setStatus('missing-key')
      return undefined
    }

    setStatus('loading')
    registeredImageIdsRef.current = new Set()
    loadTimer = window.setTimeout(() => {
      if (!cancelled) setStatus((current) => current === 'ready' ? current : 'error')
    }, 12000)

    import('olamaps-web-sdk')
      .then(async ({ OlaMaps }) => {
        if (cancelled || !elementRef.current) return

        const olaMaps = new OlaMaps({ apiKey })
        olaMapsRef.current = olaMaps
        const camera = savedCameraRef.current
        const initialStyle = desiredStyleRef.current
        map = await olaMaps.init({
          container: elementRef.current,
          style: initialStyle,
          center: camera?.center || KOLKATA_CENTER,
          zoom: camera?.zoom || 14.5,
          attributionControl: true
        })
        if (cancelled) {
          map?.remove()
          return
        }

        mapRef.current = map
        map.addControl(olaMaps.addNavigationControls({ showCompass: false }), 'bottom-right')
        map.on('error', (event) => {
          console.warn('Ola map resource error:', safeErrorMessage(event?.error))
        })

        const finishSetup = async () => {
          try {
            if (cancelled) return
            addPlaceLayers(map)

            map.on('click', CLUSTER_LAYER_ID, async (event) => {
              const cluster = event.features?.[0]
              if (!cluster) return
              const source = map.getSource(SOURCE_ID)
              const zoom = await source.getClusterExpansionZoom(cluster.properties.cluster_id)
              map.easeTo({ center: cluster.geometry.coordinates, zoom, duration: 320 })
            })
            map.on('click', PLACE_PHOTO_LAYER_ID, (event) => {
              const placeId = event.features?.[0]?.properties?.id
              if (placeId) onSelectRef.current?.(placeId)
            })
            ;[CLUSTER_LAYER_ID, PLACE_PHOTO_LAYER_ID].forEach((layerId) => {
              map.on('mouseenter', layerId, () => { map.getCanvas().style.cursor = 'pointer' })
              map.on('mouseleave', layerId, () => { map.getCanvas().style.cursor = '' })
            })

            await ensurePhotoImages(map, latestPlacesRef.current, registeredImageIdsRef.current)
            if (cancelled) return
            map.getSource(SOURCE_ID)?.setData(placesGeoJson(latestPlacesRef.current, latestSelectedIdRef.current))
            activeStyleRef.current = initialStyle
            window.clearTimeout(loadTimer)
            setStatus('ready')
          } catch (error) {
            console.error('Ola map setup failed:', safeErrorMessage(error))
            if (!cancelled) setStatus('error')
          }
        }

        map.on('load', finishSetup)
        if (map.loaded()) await finishSetup()

        map.on('dragstart', () => { userInteractingRef.current = true })
        map.on('zoomstart', (event) => {
          if (event.originalEvent) userInteractingRef.current = true
        })
        map.on('moveend', () => {
          if (!userInteractingRef.current) return
          userInteractingRef.current = false
          const bounds = map.getBounds()
          onViewportChangeRef.current?.({
            north: bounds.getNorth(),
            east: bounds.getEast(),
            south: bounds.getSouth(),
            west: bounds.getWest()
          })
        })

      })
      .catch((error) => {
        console.error('Ola map initialization failed:', safeErrorMessage(error))
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
      window.clearTimeout(loadTimer)
      syncVersionRef.current += 1
      styleSwitchVersionRef.current += 1
      styleChangingRef.current = false
      if (map) {
        const center = map.getCenter?.()
        savedCameraRef.current = center ? { center: [center.lng, center.lat], zoom: map.getZoom() } : null
      }
      userMarkerRef.current?.remove()
      userMarkerRef.current = null
      mapRef.current = null
      olaMapsRef.current = null
      activeStyleRef.current = null
      map?.remove()
    }
  }, [attempt])

  useEffect(() => {
    const map = mapRef.current
    const nextStyle = darkMode ? MAP_STYLES.dark : MAP_STYLES.light
    if (!map || status !== 'ready' || activeStyleRef.current === nextStyle) return undefined

    const switchVersion = ++styleSwitchVersionRef.current
    let timeoutId
    let retryId
    let hydrationStarted = false
    styleChangingRef.current = true
    setIsStyleChanging(true)
    registeredImageIdsRef.current = new Set()

    const handleStyleData = async () => {
      if (
        switchVersion !== styleSwitchVersionRef.current ||
        hydrationStarted
      ) return
      hydrationStarted = true
      try {
        await restorePlaceLayers(
          map,
          latestPlacesRef.current,
          latestSelectedIdRef.current,
          registeredImageIdsRef.current
        )
        if (switchVersion !== styleSwitchVersionRef.current) return
        activeStyleRef.current = nextStyle
        styleChangingRef.current = false
        map.off('styledata', handleStyleData)
        window.clearTimeout(retryId)
        window.clearTimeout(timeoutId)
        setIsStyleChanging(false)
      } catch (error) {
        if (
          switchVersion === styleSwitchVersionRef.current &&
          safeErrorMessage(error).includes('Style is not done loading')
        ) {
          hydrationStarted = false
          window.clearTimeout(retryId)
          retryId = window.setTimeout(handleStyleData, 80)
          return
        }
        console.error('Ola map theme update failed:', safeErrorMessage(error))
        if (switchVersion === styleSwitchVersionRef.current) {
          styleChangingRef.current = false
          setIsStyleChanging(false)
          setStatus('error')
        }
      }
    }

    map.on('styledata', handleStyleData)
    timeoutId = window.setTimeout(() => {
      if (switchVersion !== styleSwitchVersionRef.current) return
      styleChangingRef.current = false
      setIsStyleChanging(false)
      setStatus('error')
    }, 12000)

    try {
      map.setStyle(nextStyle, { diff: false })
      window.setTimeout(handleStyleData, 0)
    } catch (error) {
      console.error('Ola map theme update failed:', safeErrorMessage(error))
      window.clearTimeout(timeoutId)
      window.clearTimeout(retryId)
      map.off('styledata', handleStyleData)
      styleChangingRef.current = false
      setIsStyleChanging(false)
      setStatus('error')
    }

    return () => {
      window.clearTimeout(timeoutId)
      map.off('styledata', handleStyleData)
    }
  }, [darkMode, status])

  useEffect(() => {
    const map = mapRef.current
    if (!map || status !== 'ready' || styleChangingRef.current) return
    const syncVersion = ++syncVersionRef.current

    ensurePhotoImages(map, places, registeredImageIdsRef.current)
      .then(() => {
        if (syncVersion !== syncVersionRef.current || !map.getSource(SOURCE_ID)) return
        map.getSource(SOURCE_ID).setData(placesGeoJson(places, selectedPlaceId))
      })
      .catch((error) => {
        console.error('Ola place marker update failed:', safeErrorMessage(error))
        setStatus('error')
      })
  }, [placeKey, places, selectedPlaceId, status])

  useEffect(() => {
    const map = mapRef.current
    if (!map || status !== 'ready' || !places.length) return

    if (fitKey !== previousFitKeyRef.current) {
      map.fitBounds(placeBounds(places), {
        padding: { top: 120, right: 72, bottom: 92, left: 72 },
        maxZoom: 16,
        duration: 0
      })
      previousFitKeyRef.current = fitKey
    }

    const selected = places.find((place) => place.id === selectedPlaceId)
    if (selected) {
      map.easeTo({ center: [selected.coordinates.lng, selected.coordinates.lat], duration: 350 })
    }
  }, [fitKey, places, selectedPlaceId, status])

  useEffect(() => {
    const map = mapRef.current
    const olaMaps = olaMapsRef.current
    if (!map || !olaMaps || status !== 'ready') return

    userMarkerRef.current?.remove()
    userMarkerRef.current = null

    if (userPosition) {
      const element = document.createElement('span')
      element.className = styles.userMarker
      element.setAttribute('role', 'img')
      element.setAttribute('aria-label', 'Your location')
      userMarkerRef.current = olaMaps.addMarker({ element, anchor: 'center' })
        .setLngLat([userPosition.lng, userPosition.lat])
        .addTo(map)
      map.easeTo({ center: [userPosition.lng, userPosition.lat], zoom: 15, duration: 350 })
    }
  }, [status, userPosition])

  return (
    <div className={styles.mapFrame}>
      <div ref={elementRef} className={styles.map} aria-label="Interactive Ola map of nearby Kolkata places" />
      {isStyleChanging && (
        <div className={styles.mapThemeTransition} role="status" aria-live="polite">
          <span className={styles.srOnly}>Updating map theme…</span>
        </div>
      )}
      {status === 'loading' && <div className={styles.mapStatus} role="status">Loading the Kolkata map…</div>}
      {status === 'missing-key' && (
        <div className={styles.mapStatus} role="status">
          <strong>Ola Maps is ready to connect.</strong>
          <span>{process.env.NODE_ENV === 'development' ? 'Add NEXT_PUBLIC_OLA_MAPS_API_KEY to .env.local, then restart the server.' : 'Map configuration is incomplete.'}</span>
        </div>
      )}
      {status === 'error' && (
        <div className={styles.mapStatus} role="alert">
          <strong>The Ola map could not load.</strong>
          <span>Check your connection and map credentials, then try again.</span>
          <button type="button" onClick={() => setAttempt((value) => value + 1)}>Retry map</button>
        </div>
      )}
    </div>
  )
}
