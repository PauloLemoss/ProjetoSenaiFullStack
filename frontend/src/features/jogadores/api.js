import { httpClient } from '../../lib/httpClient'

/** Única responsabilidade desta camada: montar a chamada HTTP e devolver o dado ou o erro (ApiError). */

export function listPlayers(filters) {
  return httpClient.get('/players', filters)
}

export function getPlayer(playerId) {
  return httpClient.get(`/players/${playerId}`)
}

export function createPlayer(payload) {
  return httpClient.post('/players', payload)
}

export function updatePlayer(playerId, payload) {
  return httpClient.put(`/players/${playerId}`, payload)
}

export function updatePlayerCondition(playerId, condition) {
  return httpClient.patch(`/players/${playerId}/condition`, { condition })
}

export function deletePlayer(playerId) {
  return httpClient.delete(`/players/${playerId}`)
}
