import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as ligaApi from './api'
import { StandingPage } from './StandingPage'

vi.mock('./api', () => ({
  getStandings: vi.fn(),
  listMatches: vi.fn().mockResolvedValue([]),
}))

const STANDINGS = [
  {
    position: 1,
    club_id: 1,
    club_name: 'Clube A',
    played: 5,
    wins: 4,
    draws: 1,
    losses: 0,
    goals_for: 12,
    goals_against: 3,
    goal_difference: 9,
    points: 13,
  },
  {
    position: 2,
    club_id: 2,
    club_name: 'Clube B',
    played: 5,
    wins: 3,
    draws: 1,
    losses: 1,
    goals_for: 9,
    goals_against: 6,
    goal_difference: 3,
    points: 10,
  },
  {
    position: 3,
    club_id: 3,
    club_name: 'Clube C',
    played: 5,
    wins: 2,
    draws: 0,
    losses: 3,
    goals_for: 7,
    goals_against: 8,
    goal_difference: -1,
    points: 6,
  },
]

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/classificacao']}>
      <Routes>
        <Route path="classificacao" element={<StandingPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('StandingPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mostra a classificação na ordem devolvida pela API', async () => {
    ligaApi.getStandings.mockResolvedValue(STANDINGS)

    renderPage()

    await waitFor(() => expect(screen.getByText('Clube A')).toBeInTheDocument())
    expect(screen.getByText('Clube B')).toBeInTheDocument()
    expect(screen.getByText('Clube C')).toBeInTheDocument()

    expect(ligaApi.getStandings).toHaveBeenCalled()
  })

  it('mostra as colunas da classificação', async () => {
    ligaApi.getStandings.mockResolvedValue(STANDINGS)

    renderPage()
    await waitFor(() => expect(screen.getByText('Clube A')).toBeInTheDocument())

    expect(screen.getByText('#')).toBeInTheDocument()
    expect(screen.getByText('Clube')).toBeInTheDocument()
    expect(screen.getByText('J')).toBeInTheDocument()
    expect(screen.getByText('V')).toBeInTheDocument()
    expect(screen.getByText('E')).toBeInTheDocument()
    expect(screen.getByText('D')).toBeInTheDocument()
    expect(screen.getByText('GP')).toBeInTheDocument()
    expect(screen.getByText('GC')).toBeInTheDocument()
    expect(screen.getByText('SG')).toBeInTheDocument()
    expect(screen.getByText('Pts')).toBeInTheDocument()
  })

  it('mostra os valores de cada coluna', async () => {
    ligaApi.getStandings.mockResolvedValue(STANDINGS)

    renderPage()
    await waitFor(() => expect(screen.getByText('Clube A')).toBeInTheDocument())

    // Clube A: posição 1, 5 jogos, 4 vitórias, 12 gols marcados, 13 pontos
    expect(screen.getAllByText('1').length).toBeGreaterThan(0)
    expect(screen.getAllByText('5').length).toBeGreaterThan(0)
    expect(screen.getAllByText('4').length).toBeGreaterThan(0)
    expect(screen.getAllByText('12').length).toBeGreaterThan(0)
    expect(screen.getAllByText('13').length).toBeGreaterThan(0)
  })

  it('mostra estado de carregamento enquanto busca', async () => {
    let resolveStandings
    const promise = new Promise((resolve) => {
      resolveStandings = resolve
    })
    ligaApi.getStandings.mockReturnValue(promise)

    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando classificação…',
    )

    await waitFor(async () => {
      resolveStandings(STANDINGS)
    })
    await waitFor(() => expect(screen.getByText('Clube A')).toBeInTheDocument())
  })

  it('mostra erro quando a API falha', async () => {
    ligaApi.getStandings.mockRejectedValue({
      message: 'Erro ao carregar classificação.',
      status: 500,
    })

    renderPage()

    await waitFor(() =>
      expect(
        screen.getByText('Erro ao carregar classificação.'),
      ).toBeInTheDocument(),
    )
  })

  it('mostra estado vazio quando não há classificação', async () => {
    ligaApi.getStandings.mockResolvedValue([])

    renderPage()

    await waitFor(() =>
      expect(
        screen.getByText('Nenhuma classificação encontrada.'),
      ).toBeInTheDocument(),
    )
  })

  it('mostra o card de ordem da tabela com os critérios de desempate reais da API', async () => {
    ligaApi.getStandings.mockResolvedValue(STANDINGS)

    renderPage()
    await waitFor(() => expect(screen.getByText('Clube A')).toBeInTheDocument())

    expect(screen.getByText('Ordem da tabela')).toBeInTheDocument()
    expect(screen.getByText('Pontos (Pts)')).toBeInTheDocument()
    expect(screen.getByText('Saldo de gols (SG)')).toBeInTheDocument()
    expect(screen.getByText('Gols marcados (GM)')).toBeInTheDocument()
    expect(
      screen.getByText('Nome do clube (ordem alfabética)'),
    ).toBeInTheDocument()
  })

  it('mostra o card de últimas partidas com os placares recentes', async () => {
    ligaApi.getStandings.mockResolvedValue(STANDINGS)
    ligaApi.listMatches.mockResolvedValue([
      {
        id: 1,
        played_at: '2026-10-15T20:00:00-03:00',
        home: { club_id: 1, club_name: 'Clube A', goals: 2 },
        away: { club_id: 2, club_name: 'Clube B', goals: 1 },
        result: 'MANDANTE',
      },
    ])

    renderPage()
    await waitFor(() => expect(screen.getByText('Clube A')).toBeInTheDocument())

    await waitFor(() =>
      expect(screen.getByText('Últimas partidas')).toBeInTheDocument(),
    )
    expect(screen.getByText('Clube A 2×1 Clube B')).toBeInTheDocument()
  })
})
