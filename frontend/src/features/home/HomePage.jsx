import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listPlayers } from '../jogadores/api'
import { usePlayersList } from '../jogadores/usePlayersList'
import { useClubsList } from '../clubes/useClubsList'
import { listMatches, getStandings } from '../liga/api'
import './PasseLanding.css'

const FEATURES = [
  {
    number: '01',
    title: 'Jogadores',
    icon: '👥',
    to: '/jogadores',
    description:
      'Nascem livres e Apto; o valor de mercado vem da condição, agilidade e idade.',
  },
  {
    number: '02',
    title: 'Clubes',
    icon: '🏟️',
    to: '/clubes',
    description: 'Começam com 300,00 em caixa e sem jogadores.',
  },
  {
    number: '03',
    title: 'Compra',
    icon: '🛒',
    to: '/jogadores',
    description: 'Valor + taxa, até 50% do caixa, com contrato de fidelidade.',
  },
  {
    number: '04',
    title: 'Venda',
    icon: '💸',
    to: '/clubes',
    description: 'Multa antes do fim da fidelidade e comissão sobre o lucro.',
  },
  {
    number: '05',
    title: 'Histórico',
    icon: '📜',
    to: '/clubes',
    description: 'Toda compra e venda fica registrada, com totais e CSV.',
  },
  {
    number: '06',
    title: 'Liga',
    icon: '🏆',
    to: '/partidas',
    description:
      'Escale 5 titulares e jogue partidas que entram na classificação.',
  },
]

function Pitch() {
  return (
    <svg
      className="passe-pitch"
      viewBox="0 0 1200 520"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="0.5" y="0.5" width="1199" height="519" rx="1" />
        <line x1="600" y1="0" x2="600" y2="520" />
        <circle cx="600" cy="260" r="83" />
        <circle cx="600" cy="260" r="2" fill="currentColor" />
        <rect x="0" y="130" width="170" height="260" />
        <rect x="0" y="190" width="70" height="140" />
        <rect x="-20" y="225" width="20" height="70" />
        <circle cx="110" cy="260" r="2" />
        <path d="M170 207 A53 53 0 0 1 170 313" />
        <rect x="1030" y="130" width="170" height="260" />
        <rect x="1130" y="190" width="70" height="140" />
        <rect x="1200" y="225" width="20" height="70" />
        <circle cx="1090" cy="260" r="2" />
        <path d="M1030 207 A53 53 0 0 0 1030 313" />
      </g>
    </svg>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { meta: playersMeta } = usePlayersList({ page: 1, limit: 10 })
  const { clubs: homeClubs } = useClubsList('name')
  const [extraStats, setExtraStats] = useState({
    freePlayers: 0,
    totalMatches: 0,
    leader: null,
  })

  const totalPlayers = playersMeta?.total_items ?? 0
  const totalClubs = homeClubs?.length ?? 0

  useEffect(() => {
    let cancelled = false

    async function loadExtraStats() {
      const [freeResult, matchesResult, standingsResult] =
        await Promise.allSettled([
          listPlayers({ page: 1, limit: 1, free: true }),
          listMatches(),
          getStandings(),
        ])
      if (cancelled) return

      const freePlayers =
        freeResult.status === 'fulfilled'
          ? (freeResult.value?.meta?.total_items ?? 0)
          : 0
      const totalMatches =
        matchesResult.status === 'fulfilled' &&
        Array.isArray(matchesResult.value)
          ? matchesResult.value.length
          : 0
      const topClub =
        standingsResult.status === 'fulfilled' &&
        Array.isArray(standingsResult.value) &&
        standingsResult.value.length > 0 &&
        standingsResult.value[0].points > 0
          ? standingsResult.value[0]
          : null

      setExtraStats({
        freePlayers,
        totalMatches,
        leader: topClub,
      })
    }

    loadExtraStats()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key !== 'Enter') return
      const tag = event.target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      if (tag === 'BUTTON' || tag === 'A') return
      navigate('/jogadores')
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  return (
    <div className="passe-page">
      <section className="passe-frame">
        <Pitch />

        <header className="passe-brand" aria-label="Passe">
          <span className="passe-logo">P</span>
          <span className="passe-brand-name">Passe</span>
        </header>

        <div className="passe-status">
          <span className="passe-dot" />
          <strong>Liga Fictícia 2026</strong>
          {extraStats.leader && (
            <span>
              · líder: {extraStats.leader.club_name}, {extraStats.leader.points}{' '}
              pontos
            </span>
          )}
        </div>

        <section className="passe-hero">
          <h1>Gestão da liga, do mercado à classificação</h1>

          <p>
            Cadastre jogadores, monte os clubes e negocie com contrato de
            fidelidade. Depois,
            <br className="passe-desktop-break" />
            escale os titulares e jogue partidas com placar calculado pelos
            atributos.
          </p>

          <div className="passe-actions">
            <button
              className="passe-primary"
              type="button"
              onClick={() => navigate('/jogadores')}
            >
              Iniciar <span aria-hidden="true">→</span>
            </button>

            <span className="passe-test">ou tecle</span>

            <button
              className="passe-login"
              type="button"
              onClick={() => navigate('/jogadores')}
            >
              Enter
            </button>
          </div>

          <div className="passe-stats">
            <span>
              <b>👥</b> <strong>{totalPlayers}</strong> jogadores
            </span>
            <i>·</i>
            <span>
              <b>🆓</b> {extraStats.freePlayers} livres
            </span>
            <i>·</i>
            <span>
              <b>🏟️</b> <strong>{totalClubs}</strong> clubes
            </span>
            <i>·</i>
            <span>
              <b>⚽</b> {extraStats.totalMatches} partidas
            </span>
            <i>·</i>
            <span>
              <b>◉</b> Não precisa de login
            </span>
          </div>
        </section>

        <section className="passe-features" aria-label="Funcionalidades">
          {FEATURES.map((feature) => (
            <button
              type="button"
              className="passe-card"
              key={feature.number}
              onClick={() => navigate(feature.to)}
            >
              <div className="passe-card-top">
                <span className="passe-card-icon">{feature.icon}</span>
                <span className="passe-card-number">{feature.number}</span>
              </div>

              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </button>
          ))}
        </section>

        <footer className="passe-footer">
          <span aria-hidden="true">⬡</span>
          Liga Fictícia 2026 · Horário de Brasília (UTC-3).
        </footer>
      </section>
    </div>
  )
}
