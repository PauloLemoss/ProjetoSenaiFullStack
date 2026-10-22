import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Avatar } from '../shared/Avatar'
import {
  IconCalendar,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconHome,
  IconPlus,
  IconShield,
  IconTrophy,
  IconUsers,
} from '../shared/Icon'
import { ClubCreateModal } from '../features/clubes/ClubCreateModal'
import { useClubsList } from '../features/clubes/useClubsList'
import { useNavCounts } from './useNavCounts'

function NavCount({ value }) {
  if (value === null || value === undefined) return null
  return (
    <span className="text-xs font-semibold text-text-muted tabular-nums">
      {value}
    </span>
  )
}

/**
 * Barra de navegação lateral: seções agrupadas (Mercado, Liga), contador
 * numérico por item vindo direto dos totais da API, destaque forte da rota
 * ativa, lista de clubes com avatar e botão de criar, e um botão de
 * recolher/expandir (frontend-design-system, "Navegação lateral").
 */
export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)
  const [creatingClub, setCreatingClub] = useState(false)
  const [clubsExpanded, setClubsExpanded] = useState(true)
  const navigate = useNavigate()
  const counts = useNavCounts()
  const { clubs, reload: reloadClubs } = useClubsList()

  const navSections = [
    {
      title: 'Mercado',
      links: [
        {
          to: '/jogadores',
          label: 'Jogadores',
          icon: IconUsers,
          count: counts.jogadores,
        },
        {
          to: '/clubes',
          label: 'Clubes',
          icon: IconShield,
          count: clubs.length,
        },
      ],
    },
    {
      title: 'Liga',
      links: [
        {
          to: '/partidas',
          label: 'Partidas',
          icon: IconCalendar,
          count: counts.partidas,
        },
        {
          to: '/classificacao',
          label: 'Classificação',
          icon: IconTrophy,
          count: counts.classificacao,
        },
      ],
    },
  ]

  return (
    <div className="flex flex-col md:flex-row flex-1 min-w-0 relative">
      <nav
        className={`flex flex-col flex-shrink-0 border-b border-border md:border-r md:border-b-0 bg-surface p-4 transition-[width] ${
          collapsed ? 'md:w-[72px]' : 'md:w-[240px]'
        }`}
        aria-label="Navegação principal"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
            P
          </div>
          {!collapsed && <p className="font-bold text-lg text-text">Passe</p>}
        </div>

        {/* Atalho para a tela inicial, acima das seções "Mercado" e "Liga" */}
        <div className="mb-4">
          <ul className="list-none m-0 p-0 flex flex-col gap-1">
            <li>
              <NavLink
                to="/"
                aria-label="Início"
                title={collapsed ? 'Início' : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm no-underline transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-text hover:bg-bg-muted'
                  }`
                }
              >
                <IconHome className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="flex-1 truncate">Início</span>}
              </NavLink>
            </li>
          </ul>
        </div>

        {navSections.map((section) => (
          <div key={section.title} className="mb-4">
            {!collapsed && (
              <p className="mb-1 text-[0.75rem] font-semibold text-text-muted uppercase tracking-wider">
                {section.title}
              </p>
            )}
            <ul className="list-none m-0 p-0 flex flex-col gap-1">
              {section.links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    aria-label={link.label}
                    title={collapsed ? link.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm no-underline transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-text hover:bg-bg-muted'
                      }`
                    }
                  >
                    <link.icon className="w-5 h-5 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{link.label}</span>
                        <NavCount value={link.count} />
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            {!collapsed ? (
              <button
                type="button"
                onClick={() => setClubsExpanded((previous) => !previous)}
                aria-expanded={clubsExpanded}
                aria-label={
                  clubsExpanded
                    ? 'Recolher acesso rápido a clubes'
                    : 'Expandir acesso rápido a clubes'
                }
                className="flex items-center gap-1 text-[0.75rem] font-semibold text-text-muted uppercase tracking-wider hover:text-text"
              >
                Clubes
                <IconChevronDown
                  className={`w-3 h-3 transition-transform ${clubsExpanded ? '' : '-rotate-90'}`}
                />
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              aria-label="Novo clube"
              title="Novo clube"
              onClick={() => setCreatingClub(true)}
              className="flex items-center justify-center w-5 h-5 rounded text-text-muted hover:bg-bg-muted hover:text-text"
            >
              <IconPlus className="w-3.5 h-3.5" />
            </button>
          </div>
          {(collapsed || clubsExpanded) && (
            <ul className="list-none m-0 p-0 flex flex-col gap-1">
              {clubs.map((club) => (
                <li key={club.id}>
                  <NavLink
                    to={`/clubes/${club.id}`}
                    aria-label={club.name}
                    title={collapsed ? club.name : undefined}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm text-text no-underline hover:bg-bg-muted"
                  >
                    <Avatar label={club.acronym || club.name} size="sm" />
                    {!collapsed && (
                      <span className="truncate">{club.name}</span>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-auto pt-3 space-y-2">
          {!collapsed && (
            <>
              <div className="rounded-lg bg-bg-muted p-3 space-y-0.5">
                <p className="text-xs font-semibold text-text">
                  Liga Fictícia 2026
                </p>
                <p className="text-xs text-text-muted">
                  {clubs.length} clubes · {counts.jogadores ?? '—'} jogadores
                </p>
              </div>
              <div className="rounded-lg bg-bg-muted p-3 space-y-0.5">
                <p className="text-xs font-semibold text-text">
                  Última partida
                </p>
                {counts.lastMatch ? (
                  <p className="text-xs text-text-muted truncate">
                    {counts.lastMatch.home.club_name}{' '}
                    {counts.lastMatch.home.goals}×{counts.lastMatch.away.goals}{' '}
                    {counts.lastMatch.away.club_name}
                  </p>
                ) : (
                  <p className="text-xs text-text-muted">
                    Nenhuma partida ainda.
                  </p>
                )}
              </div>
              <p className="text-[0.65rem] text-text-muted text-center">
                Horário de Brasília (UTC-3)
              </p>
            </>
          )}
        </div>
      </nav>

      <button
        type="button"
        onClick={() => setCollapsed((previous) => !previous)}
        aria-label={collapsed ? 'Expandir navegação' : 'Recolher navegação'}
        className={`hidden md:flex absolute top-4 w-6 h-6 items-center justify-center rounded-full border border-border bg-surface text-text-muted shadow-sm hover:text-text z-10 ${
          collapsed ? 'left-[60px]' : 'left-[228px]'
        }`}
      >
        {collapsed ? (
          <IconChevronRight className="w-3.5 h-3.5" />
        ) : (
          <IconChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      <main className="flex-1 min-w-0 p-6">
        <Outlet />
      </main>

      {creatingClub && (
        <ClubCreateModal
          onClose={() => setCreatingClub(false)}
          onCreated={() => {
            reloadClubs()
            navigate('/clubes')
          }}
        />
      )}
    </div>
  )
}
