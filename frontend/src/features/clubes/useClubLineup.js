import { useCallback } from 'react'
import { useQuery } from '../../shared/useQuery'
import { getLineup } from '../liga/api'

export function useClubLineup(clubId) {
  const fetchFn = useCallback(() => getLineup(clubId), [clubId])
  const { data, state, errorMessage, reload } = useQuery(fetchFn, [clubId])

  return { lineup: data, state, errorMessage, reload }
}
