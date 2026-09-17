// @ts-nocheck
import { haversineDistanceKm } from './geo'
import { mergeUniquePlaces } from './normalizePlace'
import { normalizeText } from './taxonomy'

function searchScore(place, query) {
  const normalizedQuery = normalizeText(query)
  const name = normalizeText(place.name)
  const searchable = normalizeText([
    place.name,
    place.category,
    place.area,
    place.address,
    ...(place.tags ?? []),
  ].filter(Boolean).join(' '))

  let score = 0
  if (name === normalizedQuery) score += 100
  else if (name.startsWith(normalizedQuery)) score += 60
  else if (name.includes(normalizedQuery)) score += 40
  else if (searchable.includes(normalizedQuery)) score += 20
  score += Math.min(place.ratingCount ?? 0, 1000) / 100
  score += (place.rating ?? 0) * 2
  score += (place.sourceConfidence ?? 0) * 5
  return score
}

function withDistances(places, origin) {
  if (!origin) return places
  return places.map((place) => {
    if (!Number.isFinite(place.latitude) || !Number.isFinite(place.longitude)) return place
    return {
      ...place,
      distanceKm: haversineDistanceKm(origin, { lat: place.latitude, lng: place.longitude }),
    }
  })
}

export function createPlaceSearchService({ repository, provider, minimumLocalResults = 8 }) {
  if (!repository) throw new Error('A place repository is required')

  async function localResults(method, params) {
    try {
      return { places: await repository[method](params), localStatus: 'ok' }
    } catch (error) {
      console.error(`[places:database] ${error?.code || error?.name || 'unavailable'}`)
      return { places: [], localStatus: 'unavailable' }
    }
  }

  async function providerFallback(method, params) {
    if (!provider?.configured || typeof provider[method] !== 'function') {
      return { places: [], providerStatus: 'not-configured' }
    }
    try {
      return { places: await provider[method](params), providerStatus: 'ok' }
    } catch (error) {
      console.error(`[places:${provider.name ?? 'provider'}] ${error.message}`)
      return { places: [], providerStatus: 'unavailable' }
    }
  }

  return {
    async withinBounds({ bounds, category, query, limit = 250, cursor = 0 }) {
      const result = await repository.withinBounds({ bounds, category, query, limit, cursor })
      return {
        places: result.places,
        meta: {
          source: 'catalog',
          total: result.total,
          nextCursor: result.nextCursor,
        },
      }
    },

    async search({ query, category, lat, lng, limit = 20, cursor = 0 }) {
      const local = await localResults('search', { query, category, limit, cursor })
      const localPlaces = local.places
      let external = { places: [], providerStatus: 'not-needed' }
      if (cursor === 0 && localPlaces.length < Math.min(limit, minimumLocalResults)) {
        external = await providerFallback('searchText', { query, category, lat, lng, limit })
      }

      const origin = Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
      const places = withDistances(mergeUniquePlaces(localPlaces, external.places), origin)
        .sort((a, b) => searchScore(b, query) - searchScore(a, query))
        .slice(0, limit)

      return {
        places,
        meta: {
          localCount: localPlaces.length,
          localStatus: local.localStatus,
          provider: provider?.name ?? null,
          providerStatus: external.providerStatus,
          nextCursor: external.places.length ? null : (localPlaces.length === limit ? String(cursor + localPlaces.length) : null),
        },
      }
    },

    async nearby({ lat, lng, radiusKm = 5, category, limit = 20 }) {
      const local = await localResults('nearby', { lat, lng, radiusKm, category, limit })
      const localPlaces = local.places
      let external = { places: [], providerStatus: 'not-needed' }
      if (localPlaces.length < Math.min(limit, minimumLocalResults)) {
        external = await providerFallback('nearby', { lat, lng, radiusKm, category, limit })
      }

      const places = withDistances(mergeUniquePlaces(localPlaces, external.places), { lat, lng })
        .filter((place) => Number.isFinite(place.distanceKm) && place.distanceKm <= radiusKm)
        .sort((a, b) => a.distanceKm - b.distanceKm || (b.rating ?? 0) - (a.rating ?? 0))
        .slice(0, limit)

      return {
        places,
        meta: {
          localCount: localPlaces.length,
          localStatus: local.localStatus,
          provider: provider?.name ?? null,
          providerStatus: external.providerStatus,
          radiusKm,
        },
      }
    },
  }
}
