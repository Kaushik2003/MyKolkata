import { createPlacesApiHandler, parseNearbyQuery } from '../../../lib/places/request.js'
import { placeSearchService } from '../../../lib/places/runtime.js'

export function createNearbyHandler(service) {
  return createPlacesApiHandler({
    parse: parseNearbyQuery,
    service: (params) => service.nearby(params),
  })
}

export default createNearbyHandler(placeSearchService)
