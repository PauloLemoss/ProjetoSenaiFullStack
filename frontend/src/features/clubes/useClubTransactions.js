import { useCallback } from 'react'
import { useQuery } from '../../shared/useQuery'
import { listClubTransactions } from '../mercado/api'

export function useClubTransactions(clubId, filters) {
  const fetchFn = useCallback(
    () => listClubTransactions(clubId, filters),
    [clubId, filters],
  )
  const { data, state, errorMessage, reload } = useQuery(fetchFn, [
    clubId,
    JSON.stringify(filters),
  ])
  const result = data ?? { data: [], summary: {} }
  return {
    transactions: result.data,
    summary: result.summary ?? {},
    state,
    errorMessage,
    reload,
  }
}
