import { createPlacesApiHandler, parseSearchQuery } from '../../../lib/places/request.js'
import { placeSearchService } from '../../../lib/places/runtime.js'

export function createSearchHandler(service) {
  return createPlacesApiHandler({
    parse: parseSearchQuery,
    service: (params) => service.search(params),
  })
}

export default createSearchHandler(placeSearchService)
