import { OlaPlacesProvider } from '../../../lib/places/olaPlacesProvider.js'

const provider = new OlaPlacesProvider()

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end()
  }
  const reference = String(req.query.ref || '')
  if (!provider.configured || !reference || reference.length > 600) return res.status(404).end()

  try {
    const url = new URL(process.env.OLA_MAPS_PHOTO_PATH || '/places/v1/photo', `${provider.baseUrl}/`)
    url.searchParams.set('photo_reference', reference)
    url.searchParams.set('api_key', provider.apiKey)
    const headers = { Accept: 'image/*', 'X-Request-Id': globalThis.crypto?.randomUUID?.() || `mykolkata-${Date.now()}` }
    if (provider.requestOrigin) {
      headers.Origin = provider.requestOrigin
      headers.Referer = `${provider.requestOrigin}/`
    }
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 7000)
    const response = await fetch(url, { headers, redirect: 'follow', signal: controller.signal })
    clearTimeout(timeout)
    if (!response.ok) return res.status(404).end()
    const contentType = response.headers.get('content-type') || 'image/jpeg'
    if (!contentType.startsWith('image/')) return res.status(404).end()
    const bytes = Buffer.from(await response.arrayBuffer())
    if (bytes.length > 8 * 1024 * 1024) return res.status(413).end()
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
    return res.status(200).send(bytes)
  } catch {
    return res.status(404).end()
  }
}
