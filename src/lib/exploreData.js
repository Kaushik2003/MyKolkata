export const categories = [
  { name: 'Cafés', icon: 'coffee', accent: 'coral' },
  { name: 'Food', icon: 'food', accent: 'yellow' },
  { name: 'Places', icon: 'place', accent: 'blue' },
  { name: 'Culture', icon: 'culture', accent: 'red' },
  { name: 'Shopping', icon: 'shopping', accent: 'green' },
  { name: 'Experiences', icon: 'experience', accent: 'violet' }
]

export const trendingPlaces = [
  {
    id: 'howrah-golden-hour',
    name: 'Howrah at golden hour',
    category: 'Experiences',
    area: 'Howrah Bridge',
    image: '/hero-bg.jpg',
    eyebrow: 'The city, in motion',
    description: 'Catch the last light, the buses and the river in one unforgettable frame.',
    duration: 'Best at 5:30 PM'
  },
  {
    id: 'park-street-after-dark',
    name: 'Park Street after dark',
    category: 'Food',
    area: 'Park Street',
    image: '/moc.jpg',
    eyebrow: 'A classic night out',
    description: 'Old-school dining rooms, live music and a proper Kolkata evening.',
    duration: '3-stop trail'
  },
  {
    id: 'maidan-slow-morning',
    name: 'A slow Maidan morning',
    category: 'Places',
    area: 'Maidan',
    image: '/maidan.jpg',
    eyebrow: 'Before the city rushes',
    description: 'Tea, green fields and an unhurried walk under an enormous sky.',
    duration: '60–90 min'
  }
]

export const nearbyPlaces = [
  {
    id: 'the-street',
    name: 'The Street',
    category: 'Cafés',
    area: 'Park Street',
    address: 'The Park, 17 Park Street, Kolkata',
    distance: '0.8 km',
    rating: 4.6,
    image: '/street.jpg',
    description: 'An all-day café inside The Park with quick bites, coffee and a front-row seat to Park Street.',
    coordinates: { lat: 22.5540498, lng: 88.3518667 }
  },
  {
    id: 'flurys',
    name: 'Flurys',
    category: 'Cafés',
    area: 'Park Street',
    address: '18A Park Street, Kolkata',
    distance: '1.1 km',
    rating: 4.7,
    image: '/flury.avif',
    description: 'A Kolkata institution for breakfast, pastries and an old-school Park Street pause.',
    coordinates: { lat: 22.5527324, lng: 88.3525899 }
  },
  {
    id: 'indian-museum',
    name: 'Indian Museum',
    category: 'Culture',
    area: 'Chowringhee',
    address: '27 Jawaharlal Nehru Road, Kolkata',
    distance: '1.4 km',
    rating: 4.6,
    image: '/indmus.jpg',
    description: 'India’s oldest museum, with grand galleries spanning archaeology, art and natural history.',
    coordinates: { lat: 22.5575863, lng: 88.351027 }
  },
  {
    id: 'mocambo',
    name: 'Mocambo',
    category: 'Food',
    area: 'Park Street',
    address: '25B Park Street, Kolkata',
    distance: '1.7 km',
    rating: 4.5,
    image: '/moc.jpg',
    description: 'A much-loved retro dining room known for continental classics and Kolkata nostalgia.',
    coordinates: { lat: 22.5532467, lng: 88.3531768 }
  },
  {
    id: 'maidan',
    name: 'Maidan',
    category: 'Outdoors',
    area: 'Central Kolkata',
    address: 'Maidan, Esplanade, Kolkata',
    distance: '2.2 km',
    rating: 4.8,
    image: '/maidan.jpg',
    description: 'The city’s green breathing room for morning walks, football and wide-open sunset views.',
    coordinates: { lat: 22.5503487, lng: 88.3457129 }
  },
  {
    id: 'new-market',
    name: 'New Market',
    category: 'Shopping',
    area: 'Esplanade',
    address: 'Fenwick Bazar Street, Dharmatala, Kolkata',
    distance: '2.5 km',
    rating: 4.4,
    image: '/sare.jpg',
    description: 'A lively historic market for clothing, flowers, food and the joy of finding the unexpected.',
    coordinates: { lat: 22.5601523, lng: 88.3529557 }
  }
]

export const hiddenKolkata = [
  {
    id: 'jorsanko-courtyard',
    name: 'The courtyards of Jorasanko',
    category: 'Culture',
    area: 'Jorasanko',
    image: '/jstb.jpg',
    note: 'Go on a quiet weekday morning',
    description: 'Red verandahs, garden paths and stories from Bengal’s cultural renaissance.'
  },
  {
    id: 'museum-courtyard',
    name: 'Indian Museum courtyard',
    category: 'Places',
    area: 'Chowringhee',
    image: '/indmus.jpg',
    note: 'Look beyond the galleries',
    description: 'A calm, colonnaded pause hidden inside one of the city’s busiest quarters.'
  },
  {
    id: 'college-street-books',
    name: 'Book lanes after the rush',
    category: 'Shopping',
    area: 'College Street',
    image: '/ana.jpg',
    note: 'Best explored without a list',
    description: 'Second-hand finds, narrow lanes and conversations that can last an afternoon.'
  }
]

export const collections = [
  { id: 'old-kolkata', name: 'Old Kolkata', count: '8 stories', image: '/hwh.jpg', tone: 'ink' },
  { id: 'food-streets', name: 'Food Streets', count: '12 stops', image: '/moc.jpg', tone: 'red' },
  { id: 'heritage', name: 'Heritage', count: '9 places', image: '/dkt.jpg', tone: 'cream' },
  { id: 'art-culture', name: 'Art & Culture', count: '7 ideas', image: '/jstb.jpg', tone: 'blue' },
  { id: 'weekend-plans', name: 'Weekend Plans', count: '6 itineraries', image: '/street.jpg', tone: 'yellow' },
  { id: 'outdoor', name: 'Outdoor', count: '10 escapes', image: '/maidan.jpg', tone: 'green' }
]

export const allExploreItems = [
  ...trendingPlaces,
  ...nearbyPlaces,
  ...hiddenKolkata,
  ...collections.map((collection) => ({ ...collection, category: collection.name }))
]

const normalized = (value = '') => value.toLocaleLowerCase('en-IN').trim()

export function filterExploreItems(items, query = '', category = 'All') {
  const normalizedQuery = normalized(query)

  return items.filter((item) => {
    const searchable = [item.name, item.category, item.area, item.description, item.eyebrow]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('en-IN')
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery)
    const matchesCategory = category === 'All' || item.category === category
    return matchesQuery && matchesCategory
  })
}

export function filterNearbyPlaces(items, category = 'All') {
  return category === 'All' ? items : items.filter((item) => item.category === category)
}

export function searchNearbyPlaces(items, query = '', category = 'All', area = 'All areas') {
  const normalizedQuery = normalized(query)

  return items.filter((item) => {
    const searchable = [item.name, item.category, item.area, item.address, item.description]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('en-IN')
    const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery)
    const matchesCategory = category === 'All' || item.category === category
    const matchesArea = area === 'All areas' || item.area === area

    return matchesQuery && matchesCategory && matchesArea
  })
}
