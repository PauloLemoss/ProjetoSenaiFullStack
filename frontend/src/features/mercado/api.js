import { httpClient } from '../../lib/httpClient'

export function buyPlayer(playerId, payload) {
  return httpClient.post(`/players/${playerId}/buy`, payload)
}

export function sellPlayer(playerId) {
  return httpClient.post(`/players/${playerId}/sell`)
}

export function listClubTransactions(clubId, filters) {
  return httpClient.get(`/clubs/${clubId}/transactions`, filters)
}

export function exportClubTransactions(clubId, filters) {
  return httpClient.get(`/clubs/${clubId}/transactions/export`, filters)
}
