import { prisma } from '../prisma.js'
import { OlaPlacesProvider } from './olaPlacesProvider.js'
import { createPlaceSearchService } from './placeSearchService.js'
import { FallbackPlaceRepository, FilePlaceRepository } from './filePlaceRepository.js'
import { PrismaPlaceRepository } from './prismaPlaceRepository.js'

export const placeRepository = new FallbackPlaceRepository(
  new PrismaPlaceRepository(prisma),
  new FilePlaceRepository()
)

export const placeSearchService = createPlaceSearchService({
  repository: placeRepository,
  provider: new OlaPlacesProvider(),
})
