import { OlaPlacesProvider } from '../../../lib/places/olaPlacesProvider.js'
import { parseCoordinate } from '../../../lib/places/geo.js'
import { WikimediaImageProvider } from '../../../lib/places/wikimediaImageProvider.js'

const provider = new OlaPlacesProvider()
const imageProvider = new WikimediaImageProvider()

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } })
  }
  const source = String(req.query.provider || '').slice(0, 24)
  const id = String(req.query.id || '').slice(0, 240)
  const name = String(req.query.name || '').trim().slice(0, 160)
  const lat = parseCoordinate(req.query.lat, 'latitude')
  const lng = parseCoordinate(req.query.lng, 'longitude')
  if (!provider.configured || (!id && (!name || lat === null || lng === null))) {
    return res.status(200).json({ data: null, meta: { enriched: false } })
  }
  try {
    const place = source === 'ola' && id
      ? await provider.details(id)
      : await provider.resolveDetails({ name, lat, lng })
    const commonsImage = place?.image ? null : await imageProvider.findImage({ name, lat, lng })
    const enrichedPlace = place || commonsImage ? {
      ...(place || { name, latitude: lat, longitude: lng, provider: source || 'overture', providerPlaceId: id }),
      ...(commonsImage || {}),
    } : null
    res.setHeader('Cache-Control', 'private, max-age=300, stale-while-revalidate=3600')
    return res.status(200).json({ data: enrichedPlace, meta: { enriched: Boolean(enrichedPlace), provider: place ? 'ola' : commonsImage?.imageProvider || null } })
  } catch (error) {
    console.error(`[places:details] ${error?.message || 'unavailable'}`)
    return res.status(200).json({ data: null, meta: { enriched: false, providerStatus: 'unavailable' } })
  }
}
