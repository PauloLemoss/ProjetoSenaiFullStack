import { useEffect, useState } from 'react'
import { listPlayers } from './api'

const EMPTY_COUNTS = { all: null, free: null, clubbed: null }

function withoutFreeAndPaging({
  free: _free,
  page: _page,
  limit: _limit,
  ...rest
}) {
  return rest
}

/**
 * Contagens das abas Todos/Livres/Em clubes, respeitando os demais filtros
 * aplicados (busca, posição, condição, idade, valor). Cada contagem vem do
 * `meta.total_items` já devolvido por `GET /players`, sem nenhum cálculo no
 * frontend (frontend-jogadores-visual, "Abas com contagem").
 */
export function usePlayersTabCounts(filters) {
  const [counts, setCounts] = useState(EMPTY_COUNTS)
  const baseKey = JSON.stringify(withoutFreeAndPaging(filters))

  useEffect(() => {
    let cancelled = false
    const base = JSON.parse(baseKey)

    async function load() {
      const [all, free, clubbed] = await Promise.allSettled([
        listPlayers({ ...base, limit: 1 }),
        listPlayers({ ...base, free: true, limit: 1 }),
        listPlayers({ ...base, free: false, limit: 1 }),
      ])
      if (cancelled) return
      setCounts({
        all: all.status === 'fulfilled' ? all.value.meta.total_items : null,
        free: free.status === 'fulfilled' ? free.value.meta.total_items : null,
        clubbed:
          clubbed.status === 'fulfilled'
            ? clubbed.value.meta.total_items
            : null,
      })
    }

    load()
    return () => {
      cancelled = true
    }
  }, [baseKey])

  return counts
}
