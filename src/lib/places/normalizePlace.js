import { categoryFromProviderTypes, normalizeText } from './taxonomy.js'
import { haversineDistanceKm } from './geo.js'

function firstPresent(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function numberOrNull(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function extractCoordinates(raw) {
  const location = raw.geometry?.location ?? raw.coordinates ?? raw.location ?? raw.position ?? {}
  const latitude = numberOrNull(firstPresent(location.lat, location.latitude, raw.latitude, raw.lat))
  const longitude = numberOrNull(firstPresent(location.lng, location.lon, location.longitude, raw.longitude, raw.lng))
  return { latitude, longitude }
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function normalizeProviderPlace(raw, provider = 'unknown') {
  const name = firstPresent(raw.name, raw.display_name, raw.displayName?.text, raw.structured_formatting?.main_text, raw.description)
  if (!name) return null

  const providerPlaceId = String(firstPresent(raw.place_id, raw.placeId, raw.id, raw.reference, '') || '')
  const types = firstPresent(raw.types, raw.categories, raw.category, raw.type, [])
  const typeList = (Array.isArray(types) ? types : [types])
    .map((type) => typeof type === 'object' ? firstPresent(type.name, type.slug, type.id) : type)
    .filter(Boolean)
  const category = categoryFromProviderTypes(typeList)
  const { latitude, longitude } = extractCoordinates(raw)
  const address = firstPresent(raw.formatted_address, raw.formattedAddress, raw.address, raw.vicinity)
  const area = firstPresent(raw.area, raw.neighbourhood, raw.neighborhood, raw.address_components?.locality)
  const rating = numberOrNull(raw.rating)
  const ratingCount = numberOrNull(firstPresent(raw.user_ratings_total, raw.ratingCount, raw.rating_count))
  const distanceMeters = numberOrNull(firstPresent(raw.distance_meters, raw.distanceMeters))
  const phone = firstPresent(raw.phone, raw.formatted_phone_number, raw.international_phone_number, raw.phones?.[0])
  const website = firstPresent(raw.website, raw.website_url, raw.url)
  const openingHours = firstPresent(raw.opening_hours?.weekday_text, raw.openingHours?.weekdayText, raw.opening_hours, raw.openingHours)

  return {
    provider,
    providerPlaceId,
    slug: `${slugify(name)}${providerPlaceId ? `-${slugify(providerPlaceId).slice(-8)}` : ''}`,
    name: String(name).trim(),
    description: firstPresent(raw.description, raw.summary) ?? null,
    address: address ? String(address).trim() : null,
    area: area ? String(area).trim() : null,
    latitude,
    longitude,
    category: category.name,
    categorySlug: category.slug,
    tags: typeList.map(normalizeText).filter(Boolean),
    rating,
    ratingCount: ratingCount === null ? null : Math.max(0, Math.round(ratingCount)),
    status: firstPresent(raw.business_status, raw.status) ?? null,
    image: firstPresent(raw.image, raw.photoUrl, raw.photo_url) ?? null,
    phone: phone ? String(phone) : null,
    website: website ? String(website) : null,
    openingHours: openingHours ?? null,
    sourceConfidence: provider === 'ola' ? 0.9 : 0.7,
    lastVerifiedAt: new Date().toISOString(),
    distanceKm: distanceMeters === null ? undefined : distanceMeters / 1000,
  }
}

export function placeIdentityKey(place) {
  if (place.provider && place.providerPlaceId) return `${place.provider}:${place.providerPlaceId}`
  const lat = Number.isFinite(place.latitude) ? place.latitude.toFixed(4) : ''
  const lng = Number.isFinite(place.longitude) ? place.longitude.toFixed(4) : ''
  return `${normalizeText(place.name)}:${lat}:${lng}`
}

function sameCoordinates(left, right) {
  if (![left.latitude, left.longitude, right.latitude, right.longitude].every(Number.isFinite)) return false
  return haversineDistanceKm(
    { lat: left.latitude, lng: left.longitude },
    { lat: right.latitude, lng: right.longitude }
  ) <= 0.12
}

function sameContact(left, right) {
  const phone = (value) => String(value ?? '').replace(/\D/g, '').slice(-10)
  const leftPhone = phone(left.phone)
  const rightPhone = phone(right.phone)
  if (leftPhone && rightPhone && leftPhone === rightPhone) return true

  try {
    return Boolean(left.website && right.website && new URL(left.website).hostname === new URL(right.website).hostname)
  } catch {
    return false
  }
}

export function placeMatchConfidence(left, right) {
  if (left.provider && right.provider && left.provider === right.provider
    && left.providerPlaceId && left.providerPlaceId === right.providerPlaceId) return 1

  let score = 0
  if (normalizeText(left.name) === normalizeText(right.name)) score += 0.55
  if (sameCoordinates(left, right)) score += 0.35
  if (sameContact(left, right)) score += 0.45
  return Math.min(score, 1)
}

export function mergeUniquePlaces(...groups) {
  const merged = []
  for (const place of groups.flat()) {
    if (!place) continue
    const existingIndex = merged.findIndex((candidate) =>
      placeIdentityKey(candidate) === placeIdentityKey(place)
      || placeMatchConfidence(candidate, place) >= 0.85
    )
    if (existingIndex === -1) {
      merged.push(place)
      continue
    }

    const existing = merged[existingIndex]
    merged[existingIndex] = {
      ...place,
      ...existing,
      tags: [...new Set([...(existing.tags ?? []), ...(place.tags ?? [])])],
      sourceConfidence: Math.max(existing.sourceConfidence ?? 0, place.sourceConfidence ?? 0),
    }
  }
  return merged
}
