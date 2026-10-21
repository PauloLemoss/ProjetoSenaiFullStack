import { httpClient } from '../../lib/httpClient'

export function listClubs(sort) {
  return httpClient.get('/clubs', sort ? { sort } : undefined)
}

export function createClub(payload) {
  return httpClient.post('/clubs', payload)
}

export function updateClub(clubId, payload) {
  return httpClient.put(`/clubs/${clubId}`, payload)
}

export function getClub(clubId) {
  return httpClient.get(`/clubs/${clubId}`)
}
