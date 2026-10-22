import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as ligaApi from './api'
import { MatchDetailsPage } from './MatchDetailsPage'

vi.mock('./api', () => ({
  getMatch: vi.fn(),
}))

const MATCH = {
  id: 1,
  played_at: '2026-10-15T20:00:00-03:00',
  home: { club_id: 1, club_name: 'Clube A', formation: '2-1-1', goals: 2 },
  away: { club_id: 2, club_name: 'Clube B', formation: '3-1', goals: 1 },
  result: 'MANDANTE',
  duels: [
    {
      order: 1,
      attacking_club_id: 1,
      attacker: {
        player_id: 10,
        player_name: 'Atacante A',
        position: 'ATA',
        condition: 'APTO',
        attribute: 'shooting',
        value: 85,
      },
      defender: {
        player_id: 20,
        player_name: 'Zagueiro B',
        position: 'ZAG',
        condition: 'APTO',
        attribute: 'defending',
        value: 70,
      },
      goal: true,
    },
    {
      order: 2,
      attacking_club_id: 2,
      attacker: {
        player_id: 30,
        player_name: 'Meia B',
        position: 'MEI',
        condition: 'APTO',
        attribute: 'passing',
        value: 80,
      },
      defender: {
        player_id: 40,
        player_name: 'Lateral A',
        position: 'LAT',
        condition: 'APTO',
        attribute: 'defending',
        value: 75,
      },
      goal: false,
    },
  ],
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/partidas/1']}>
      <Routes>
        <Route path="partidas/:matchId" element={<MatchDetailsPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('MatchDetailsPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('busca a partida pelo id da rota e mostra o placar', async () => {
    ligaApi.getMatch.mockResolvedValue(MATCH)
    renderPage()

    await waitFor(() =>
      expect(screen.getAllByText('Clube A').length).toBeGreaterThan(0),
    )
    expect(ligaApi.getMatch).toHaveBeenCalledWith('1')
    expect(screen.getByText('2 × 1')).toBeInTheDocument()
    expect(screen.getAllByText('Clube B').length).toBeGreaterThan(0)
  })

  it('mostra o link para voltar às partidas', async () => {
    ligaApi.getMatch.mockResolvedValue(MATCH)
    renderPage()

    await waitFor(() =>
      expect(
        screen.getByRole('link', { name: /Voltar para partidas/ }),
      ).toBeInTheDocument(),
    )
  })

  it('mostra os duelos divididos entre ataques do mandante e do visitante', async () => {
    ligaApi.getMatch.mockResolvedValue(MATCH)
    renderPage()

    await waitFor(() =>
      expect(
        screen.getByText('Ataques do Mandante — Clube A'),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getByText('Ataques do Visitante — Clube B'),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Atacante A').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Meia B').length).toBeGreaterThan(0)
    expect(screen.getByText('Gol')).toBeInTheDocument()
    expect(screen.getByText('Sem gol')).toBeInTheDocument()
  })

  it('mostra erro quando a API falha', async () => {
    ligaApi.getMatch.mockRejectedValue({
      message: 'Partida não encontrada.',
      status: 404,
    })
    renderPage()

    await waitFor(() =>
      expect(screen.getByText('Partida não encontrada.')).toBeInTheDocument(),
    )
  })
})
