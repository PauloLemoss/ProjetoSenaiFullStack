import { useCallback } from 'react'
import { useQuery } from '../../shared/useQuery'
import { getClub } from './api'

export function useClub(clubId) {
  const fetchFn = useCallback(() => getClub(clubId), [clubId])
  const { data, state, errorMessage, reload } = useQuery(fetchFn, [clubId])

  return { club: data, state, errorMessage, reload }
}
