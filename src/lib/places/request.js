import { parseCoordinate } from './geo.js'
import { findCategory } from './taxonomy.js'

export class RequestValidationError extends Error {}

function single(value) {
  return Array.isArray(value) ? value[0] : value
}

export function parseLimit(value, fallback = 20, maximum = 50) {
  const parsed = Number.parseInt(single(value), 10)
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), maximum) : fallback
}

function boundedNumber(value, name, minimum, maximum) {
  const parsed = Number(single(value))
  if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) {
    throw new RequestValidationError(`Invalid ${name}`)
  }
  return parsed
}

function parseCategory(value) {
  const raw = String(single(value) ?? '').trim()
  if (!raw || raw.toLocaleLowerCase('en-IN') === 'all') return undefined
  const category = findCategory(raw)
  if (!category) throw new RequestValidationError('Unknown category')
  return category.slug
}

function optionalOrigin(query) {
  const hasLat = single(query.lat) !== undefined
  const hasLng = single(query.lng) !== undefined
  if (hasLat !== hasLng) throw new RequestValidationError('Latitude and longitude must be provided together')
  if (!hasLat) return { lat: undefined, lng: undefined }

  const lat = parseCoordinate(single(query.lat), 'latitude')
  const lng = parseCoordinate(single(query.lng), 'longitude')
  if (lat === null || lng === null) throw new RequestValidationError('Invalid coordinates')
  return { lat, lng }
}

export function parseSearchQuery(query = {}) {
  const text = String(single(query.q) ?? '').trim().slice(0, 120)
  if (text.length < 2) throw new RequestValidationError('Search query must contain at least 2 characters')
  return {
    query: text,
    category: parseCategory(query.category),
    ...optionalOrigin(query),
    cursor: Math.max(0, Number.parseInt(single(query.cursor), 10) || 0),
    limit: parseLimit(query.limit),
  }
}

export function parseNearbyQuery(query = {}) {
  const { lat, lng } = optionalOrigin(query)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new RequestValidationError('Latitude and longitude are required')
  }
  const requestedRadius = Number(single(query.radiusKm) ?? 5)
  const radiusKm = Number.isFinite(requestedRadius)
    ? Math.min(Math.max(requestedRadius, 0.1), 25)
    : 5

  return {
    lat,
    lng,
    radiusKm,
    category: parseCategory(query.category),
    limit: parseLimit(query.limit),
  }
}

export function parseBoundsQuery(query = {}) {
  const bounds = {
    west: boundedNumber(query.west, 'west bound', -180, 180),
    south: boundedNumber(query.south, 'south bound', -90, 90),
    east: boundedNumber(query.east, 'east bound', -180, 180),
    north: boundedNumber(query.north, 'north bound', -90, 90),
  }
  if (bounds.west >= bounds.east || bounds.south >= bounds.north) {
    throw new RequestValidationError('Map bounds are reversed')
  }
  if ((bounds.east - bounds.west) * (bounds.north - bounds.south) > 1) {
    throw new RequestValidationError('Map bounds are too large')
  }
  const rawQuery = String(single(query.q) ?? '').trim().slice(0, 120)
  const cursor = Number.parseInt(single(query.cursor), 10)
  return {
    bounds,
    category: parseCategory(query.category),
    query: rawQuery || undefined,
    cursor: Number.isFinite(cursor) ? Math.max(0, cursor) : 0,
    limit: parseLimit(query.limit, 250, 500),
  }
}

export function createPlacesApiHandler({ service, parse }) {
  return async function handler(req, res) {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET')
      return res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } })
    }

    try {
      const params = parse(req.query)
      const result = await service(params)
      res.setHeader('Cache-Control', 'private, max-age=0, must-revalidate')
      return res.status(200).json({ data: result.places, meta: { ...result.meta, count: result.places.length } })
    } catch (error) {
      if (error instanceof RequestValidationError) {
        return res.status(400).json({ error: { code: 'INVALID_REQUEST', message: error.message } })
      }
      console.error(error)
      return res.status(503).json({ error: { code: 'PLACES_UNAVAILABLE', message: 'Places are temporarily unavailable' } })
    }
  }
}
