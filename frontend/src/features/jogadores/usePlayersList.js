import { useCallback } from 'react'
import { useQuery } from '../../shared/useQuery'
import { listPlayers } from './api'

const EMPTY_RESULT = {
  data: [],
  meta: { total_items: 0, total_pages: 0, page: 1, limit: 10 },
}

export function usePlayersList(filters) {
  const filtersKey = JSON.stringify(filters)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchFn = useCallback(() => listPlayers(filters), [filtersKey])
  const { data, state, errorMessage, reload } = useQuery(fetchFn, [filtersKey])

  const result = data ?? EMPTY_RESULT
  return {
    players: result.data,
    meta: result.meta,
    state,
    errorMessage,
    reload,
  }
}
