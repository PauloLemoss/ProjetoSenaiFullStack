import { useEffect, useState } from 'react'
import { listPlayers } from '../features/jogadores/api'
import { listMatches, getStandings } from '../features/liga/api'

const EMPTY_COUNTS = {
  jogadores: null,
  partidas: null,
  classificacao: null,
  lastMatch: null,
}

/**
 * Contadores numéricos da navegação lateral (Jogadores, Partidas,
 * Classificação), vindos diretamente dos totais já devolvidos pelos
 * endpoints existentes, sem nenhum cálculo no frontend
 * (frontend-design-system, "Navegação lateral com contadores"). Também
 * expõe a última partida (primeiro item de `listMatches`), reaproveitada no
 * card "Última Partida" do rodapé da sidebar (roeirotela.md, 1 "Rodapé:
 * Última Partida"), sem uma segunda chamada à API.
 * O contador de clubes vem de `useClubsList` (tamanho da lista), não daqui.
 */
export function useNavCounts() {
  const [counts, setCounts] = useState(EMPTY_COUNTS)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [playersResult, matchesResult, standingsResult] =
        await Promise.allSettled([
          listPlayers({ limit: 1 }),
          listMatches(),
          getStandings(),
        ])
      if (cancelled) return
      setCounts({
        jogadores:
          playersResult.status === 'fulfilled'
            ? playersResult.value.meta.total_items
            : null,
        partidas:
          matchesResult.status === 'fulfilled'
            ? matchesResult.value.length
            : null,
        classificacao:
          standingsResult.status === 'fulfilled'
            ? standingsResult.value.length
            : null,
        lastMatch:
          matchesResult.status === 'fulfilled'
            ? (matchesResult.value[0] ?? null)
            : null,
      })
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  return counts
}
