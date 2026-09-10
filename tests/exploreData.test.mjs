import assert from 'node:assert/strict'
import test from 'node:test'
import {
  allExploreItems,
  filterExploreItems,
  filterNearbyPlaces,
  findExploreGuide,
  nearbyPlaces,
  searchNearbyPlaces
} from '../src/lib/exploreData.js'

test('Explore search matches names, areas, categories and descriptions without case sensitivity', () => {
  assert.equal(filterExploreItems(allExploreItems, 'HOWRAH').some((item) => item.id === 'howrah-golden-hour'), true)
  assert.equal(filterExploreItems(allExploreItems, 'slow maidan').some((item) => item.id === 'maidan-slow-morning'), true)
  assert.equal(filterExploreItems(allExploreItems, 'culture').length > 0, true)
})

test('Explore category selection returns only exact category matches', () => {
  const cafes = filterExploreItems(allExploreItems, '', 'Cafés')
  assert.equal(cafes.length > 0, true)
  assert.equal(cafes.every((item) => item.category === 'Cafés'), true)
})

test('Explore combines search and category filters', () => {
  const results = filterExploreItems(allExploreItems, 'Park Street', 'Food')
  assert.deepEqual(results.map((item) => item.id), ['park-street-after-dark', 'mocambo'])
})

test('Nearby filtering keeps all places for All and supports an empty result', () => {
  assert.equal(filterNearbyPlaces(nearbyPlaces, 'All').length, nearbyPlaces.length)
  assert.deepEqual(filterNearbyPlaces(nearbyPlaces, 'Experiences'), [])
})

test('Near You search combines place, category, and area filters', () => {
  assert.deepEqual(searchNearbyPlaces(nearbyPlaces, 'pastries').map((item) => item.id), ['flurys'])
  assert.deepEqual(searchNearbyPlaces(nearbyPlaces, '', 'Cafés', 'Park Street').map((item) => item.id), ['the-street', 'flurys'])
  assert.deepEqual(searchNearbyPlaces(nearbyPlaces, 'museum', 'Food'), [])
})

test('every nearby place has real geographic coordinates and an address', () => {
  nearbyPlaces.forEach((place) => {
    assert.equal(Number.isFinite(place.coordinates.lat), true)
    assert.equal(Number.isFinite(place.coordinates.lng), true)
    assert.equal(place.coordinates.lat > 22.4 && place.coordinates.lat < 22.7, true)
    assert.equal(place.coordinates.lng > 88.2 && place.coordinates.lng < 88.5, true)
    assert.equal(Boolean(place.address), true)
  })
})

test('Explore content excludes Pujo', () => {
  const text = JSON.stringify(allExploreItems).toLocaleLowerCase('en-IN')
  assert.equal(text.includes('pujo'), false)
  assert.equal(text.includes('pandal'), false)
})

test('editorial guides resolve to useful map queries or category feeds', () => {
  assert.deepEqual(findExploreGuide('park-street-after-dark').destination, {
    query: 'Park Street', category: 'Food', view: 'grid'
  })
  assert.equal(findExploreGuide('museum-courtyard').destination.query, 'Indian Museum')
  assert.equal(findExploreGuide('food-streets').destination.category, 'Food')
  assert.equal(findExploreGuide('not-real'), null)
})
