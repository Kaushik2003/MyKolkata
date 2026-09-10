import { cached } from '../cache.js'
import { normalizeProviderPlace } from './normalizePlace.js'
import { providerTypesForCategory } from './taxonomy.js'
import { normalizeText } from './taxonomy.js'

const DEFAULT_BASE_URL = 'https://api.olamaps.io'
const PROVIDER_CACHE_MS = 5 * 60 * 1000

function createRequestId() {
  return globalThis.crypto?.randomUUID?.() || `mykolkata-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function extractResults(payload) {
  if (Array.isArray(payload)) return payload
  if (payload?.result && typeof payload.result === 'object') return [payload.result]
  return payload?.places ?? payload?.results ?? payload?.predictions ?? payload?.data?.places ?? payload?.data?.results ?? []
}

function publicError(status) {
  if (status === 401 || status === 403) return 'Ola Places credentials were rejected'
  if (status === 429) return 'Ola Places rate limit reached'
  return 'Ola Places request failed'
}

export class OlaPlacesProvider {
  constructor({
    apiKey = process.env.OLA_MAPS_API_KEY,
    baseUrl = process.env.OLA_MAPS_BASE_URL || DEFAULT_BASE_URL,
    requestOrigin = process.env.OLA_MAPS_REQUEST_ORIGIN || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : ''),
    fetchImpl = globalThis.fetch,
    timeoutMs = 6000,
  } = {}) {
    this.apiKey = apiKey
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.requestOrigin = requestOrigin.replace(/\/$/, '')
    this.fetchImpl = fetchImpl
    this.timeoutMs = timeoutMs
    this.name = 'ola'
  }

  get configured() {
    return Boolean(this.apiKey && this.fetchImpl)
  }

  async request(path, params) {
    if (!this.configured) return []

    const payload = await this.requestRaw(path, params)
    return extractResults(payload)
      .map((place) => normalizeProviderPlace(place, this.name))
      .filter(Boolean)
  }

  async requestRaw(path, params) {
    if (!this.configured) return null

    const url = new URL(path, `${this.baseUrl}/`)
    for (const [key, value] of Object.entries({ ...params, api_key: this.apiKey })) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value))
    }

    const cacheKey = `ola:${url.pathname}:${[...url.searchParams.entries()]
      .filter(([key]) => key !== 'api_key')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&')}`

    return cached(cacheKey, PROVIDER_CACHE_MS, async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs)
      try {
        const headers = {
          Accept: 'application/json',
          'X-Request-Id': createRequestId(),
        }
        if (this.requestOrigin) {
          headers.Origin = this.requestOrigin
          headers.Referer = `${this.requestOrigin}/`
        }

        const response = await this.fetchImpl(url, {
          headers,
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(publicError(response.status))
        return response.json()
      } catch (error) {
        if (error?.name === 'AbortError') throw new Error('Ola Places request timed out')
        throw new Error(error?.message?.includes(this.apiKey) ? 'Ola Places request failed' : error.message)
      } finally {
        clearTimeout(timeout)
      }
    })
  }

  async details(placeId) {
    if (!placeId) return null
    let payload
    try {
      payload = await this.requestRaw(process.env.OLA_MAPS_ADVANCED_DETAILS_PATH || '/places/v1/details/advanced', { place_id: placeId })
    } catch {
      payload = await this.requestRaw(process.env.OLA_MAPS_DETAILS_PATH || '/places/v1/details', { place_id: placeId })
    }
    const raw = extractResults(payload)[0]
    if (!raw) return null
    const normalized = normalizeProviderPlace(raw, this.name)
    const photos = (raw.photos || raw.photo_references || [])
      .map((photo) => typeof photo === 'string' ? photo : photo.photo_reference || photo.photoReference || photo.reference)
      .filter(Boolean)
      .slice(0, 6)
      .map((reference) => `/api/explore/photo?ref=${encodeURIComponent(reference)}`)
    return {
      ...normalized,
      photos,
      image: photos[0] || normalized.image,
      imageAttribution: photos.length ? 'Ola Maps' : null,
      imageProvider: photos.length ? 'ola' : null,
    }
  }

  async resolveDetails({ name, lat, lng }) {
    const candidates = await this.searchText({ query: name, lat, lng, limit: 10 })
    const targetTokens = new Set(normalizeText(name).split(' ').filter((token) => token.length > 2 && token !== 'kolkata'))
    const ranked = candidates
      .filter((place) => place.providerPlaceId)
      .map((place) => {
        const candidateName = normalizeText(place.name)
        const candidateTokens = new Set(candidateName.split(' ').filter((token) => token.length > 2 && token !== 'kolkata'))
        const matches = [...targetTokens].filter((token) => candidateTokens.has(token)).length
        const similarity = targetTokens.size ? matches / targetTokens.size : 0
        const exact = candidateName === normalizeText(name) ? 2 : 0
        return { place, score: exact + similarity }
      })
      .sort((left, right) => right.score - left.score)
    const candidate = ranked[0]?.score >= 0.5 ? ranked[0].place : null
    return candidate ? this.details(candidate.providerPlaceId) : null
  }

  async searchText({ query, category, lat, lng, limit = 20 }) {
    const types = providerTypesForCategory(category)
    const cityScopedQuery = /\bkolkata\b/i.test(query) ? query : `${query} in Kolkata`
    const places = await this.request(process.env.OLA_MAPS_TEXT_SEARCH_PATH || '/places/v1/textsearch', {
      input: cityScopedQuery,
      location: Number.isFinite(lat) && Number.isFinite(lng) ? `${lat},${lng}` : undefined,
      types: types.length ? types.join(',') : undefined,
    })
    return places.slice(0, limit)
  }

  async nearby({ lat, lng, radiusKm = 5, category, limit = 20 }) {
    const types = providerTypesForCategory(category)
    const places = await this.request(process.env.OLA_MAPS_NEARBY_SEARCH_PATH || '/places/v1/nearbysearch', {
      layers: 'venue',
      location: `${lat},${lng}`,
      radius: Math.round(radiusKm * 1000),
      types: (types.length ? types : ['tourist_attraction']).join(','),
    })

    const candidates = places.slice(0, Math.min(limit, 12))
    return Promise.all(candidates.map(async (place) => {
      if (Number.isFinite(place.latitude) && Number.isFinite(place.longitude)) return place
      if (!place.providerPlaceId) return place
      try {
        const details = await this.request('/places/v1/details', { place_id: place.providerPlaceId })
        return details[0] ? {
          ...place,
          ...details[0],
          distanceKm: place.distanceKm,
        } : place
      } catch {
        return place
      }
    }))
  }
}
