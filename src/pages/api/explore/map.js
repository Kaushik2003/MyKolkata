import { createPlacesApiHandler, parseBoundsQuery } from '../../../lib/places/request.js'
import { placeSearchService } from '../../../lib/places/runtime.js'

export function createMapHandler(service) {
  return createPlacesApiHandler({
    parse: parseBoundsQuery,
    service: (params) => service.withinBounds(params),
  })
}

export default createMapHandler(placeSearchService)
