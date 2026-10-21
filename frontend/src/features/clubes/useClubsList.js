import { useCallback } from 'react'
import { useQuery } from '../../shared/useQuery'
import { listClubs } from './api'

export function useClubsList(sort) {
  const fetchFn = useCallback(() => listClubs(sort), [sort])
  const { data, state, errorMessage, reload } = useQuery(fetchFn, [sort])

  return { clubs: data ?? [], state, errorMessage, reload }
}
