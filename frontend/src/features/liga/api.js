import { httpClient } from '../../lib/httpClient'

export function getLineup(clubId) {
  return httpClient.get(`/clubs/${clubId}/lineup`)
}

export function saveLineup(clubId, payload) {
  return httpClient.put(`/clubs/${clubId}/lineup`, payload)
}

export function createMatch(payload) {
  return httpClient.post('/matches', payload)
}

export function listMatches(clubId) {
  return httpClient.get('/matches', clubId ? { club_id: clubId } : undefined)
}

export function getMatch(matchId) {
  return httpClient.get(`/matches/${matchId}`)
}

export function getStandings() {
  return httpClient.get('/standings')
}
