// @ts-nocheck
const TAXONOMY = [
  { slug: 'cafes', name: 'Cafés', aliases: ['cafe', 'cafes', 'café', 'coffee', 'coffee shop', 'bakery'] },
  { slug: 'food', name: 'Food', aliases: ['food', 'restaurant', 'restaurants', 'dining', 'street food'] },
  { slug: 'places', name: 'Places', aliases: ['place', 'places', 'landmark', 'attraction', 'museum', 'monument'] },
  { slug: 'culture', name: 'Culture', aliases: ['culture', 'art', 'gallery', 'theatre', 'theater', 'heritage'] },
  { slug: 'shopping', name: 'Shopping', aliases: ['shopping', 'shop', 'shops', 'market', 'mall'] },
  { slug: 'experiences', name: 'Experiences', aliases: ['experience', 'experiences', 'event', 'events', 'activity'] },
  { slug: 'outdoors', name: 'Outdoors', aliases: ['outdoors', 'outdoor', 'park', 'garden', 'nature'] },
]

export const categories = Object.freeze(TAXONOMY.map(({ aliases, ...category }) => category))

export function normalizeText(value = '') {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('en-IN')
}

export function findCategory(value) {
  const normalized = normalizeText(value)
  if (!normalized || normalized === 'all') return null

  return TAXONOMY.find((category) =>
    category.slug === normalized ||
    normalizeText(category.name) === normalized ||
    category.aliases.some((alias) => normalizeText(alias) === normalized)
  ) ?? null
}

export function categoryFromProviderTypes(types = []) {
  for (const type of Array.isArray(types) ? types : [types]) {
    const normalized = normalizeText(type).replaceAll('_', ' ')
    const direct = findCategory(normalized)
    if (direct) return direct

    const partial = TAXONOMY.find((category) =>
      category.aliases.some((alias) => normalized.includes(normalizeText(alias)))
    )
    if (partial) return partial
  }

  return { slug: 'places', name: 'Places' }
}

export function providerTypesForCategory(value) {
  const category = findCategory(value)
  if (!category) return []

  const providerTypes = {
    cafes: ['cafe', 'coffee_shop', 'bakery'],
    food: ['restaurant', 'food'],
    places: ['tourist_attraction', 'museum', 'landmark'],
    culture: ['museum', 'art_gallery', 'theatre', 'heritage'],
    shopping: ['shopping_mall', 'market', 'store'],
    experiences: ['event_venue', 'tourist_attraction'],
    outdoors: ['park', 'garden'],
  }

  return providerTypes[category.slug] ?? []
}
