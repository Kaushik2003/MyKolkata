const PLACE_CATEGORIES = new Set([
  'cafes', 'food', 'places', 'culture', 'outdoors', 'shopping', 'experiences'
])

function categoryKey(value = '') {
  return String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function inferArea(address = '') {
  const parts = String(address).split(',').map((part) => part.trim()).filter(Boolean)
  const kolkataIndex = parts.findIndex((part) => /^kolkata$/i.test(part))
  if (kolkataIndex > 0) return parts[kolkataIndex - 1]
  return 'Kolkata'
}

export function formatDistance(distanceKm) {
  if (!Number.isFinite(distanceKm)) return null
  if (distanceKm < 1) return `${Math.max(50, Math.round(distanceKm * 1000 / 50) * 50)} m`
  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)} km`
}

export function presentLivePlace(place) {
  const latitude = place.latitude === null || place.latitude === undefined ? Number.NaN : Number(place.latitude)
  const longitude = place.longitude === null || place.longitude === undefined ? Number.NaN : Number(place.longitude)
  const key = place.categorySlug || categoryKey(place.category)
  const area = place.area || inferArea(place.address)

  return {
    ...place,
    id: place.providerPlaceId || place.slug || place.id,
    category: place.category || 'Places',
    area,
    address: place.address || `${area}, Kolkata`,
    distance: formatDistance(place.distanceKm === null || place.distanceKm === undefined ? Number.NaN : Number(place.distanceKm)),
    // Never present generic category artwork as a photo of a specific venue.
    image: place.image || null,
    hasRealImage: Boolean(place.image),
    markerCategory: PLACE_CATEGORIES.has(key) ? key : 'places',
    description: place.description || `A Kolkata ${String(place.category || 'place').toLowerCase()} worth discovering.`,
    rating: Number(place.rating) > 0 ? Number(place.rating) : null,
    coordinates: { lat: latitude, lng: longitude },
  }
}

export async function fetchLivePlaces(path, { signal } = {}) {
  const response = await fetch(path, { signal, headers: { Accept: 'application/json' } })
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error(payload?.error?.message || 'Could not load Kolkata places')
  return {
    places: (payload?.data || [])
      .map(presentLivePlace)
      .filter((place) => Number.isFinite(place.coordinates.lat) && Number.isFinite(place.coordinates.lng)),
    meta: payload?.meta || {},
  }
}

export async function fetchPlaceDetails(place, { signal } = {}) {
  const params = new URLSearchParams({
    provider: place.provider || '',
    id: place.providerPlaceId || place.id || '',
    name: place.name || '',
    lat: String(place.coordinates.lat),
    lng: String(place.coordinates.lng),
  })
  const response = await fetch(`/api/explore/details?${params}`, { signal, headers: { Accept: 'application/json' } })
  const payload = await response.json().catch(() => null)
  if (!response.ok) throw new Error('Could not enrich this place')
  return payload?.data ? presentLivePlace(payload.data) : null
}
