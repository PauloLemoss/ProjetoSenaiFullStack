import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as clubesApi from '../clubes/api'
import * as ligaApi from '../liga/api'
import { MatchPage } from './MatchPage'
import { MatchDetailsPage } from './MatchDetailsPage'

vi.mock('../clubes/api', () => ({
  listClubs: vi.fn().mockResolvedValue([]),
}))
vi.mock('../liga/api', () => ({
  createMatch: vi.fn(),
  listMatches: vi.fn().mockResolvedValue([]),
  getMatch: vi.fn(),
}))

const CLUBS = [
  { id: 1, name: 'Clube A', acronym: 'CLU' },
  { id: 2, name: 'Clube B', acronym: 'CLB' },
]

const MATCHES = [
  {
    id: 1,
    played_at: '2026-10-15T20:00:00-03:00',
    home: { club_id: 1, club_name: 'Clube A', formation: '2-1-1', goals: 2 },
    away: { club_id: 2, club_name: 'Clube B', formation: '3-1', goals: 1 },
    result: 'MANDANTE',
  },
  {
    id: 2,
    played_at: '2026-10-14T15:00:00-03:00',
    home: { club_id: 2, club_name: 'Clube B', formation: '3-1', goals: 1 },
    away: { club_id: 1, club_name: 'Clube A', formation: '2-1-1', goals: 0 },
    result: 'VISITANTE',
  },
]

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/partidas']}>
      <Routes>
        <Route path="partidas" element={<MatchPage />} />
        <Route path="partidas/:matchId" element={<MatchDetailsPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('MatchPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mostra o card da última partida com o placar mais recente', async () => {
    clubesApi.listClubs.mockResolvedValue(CLUBS)
    ligaApi.listMatches.mockResolvedValue(MATCHES)

    renderPage()

    await waitFor(() =>
      expect(screen.getByText('Última partida')).toBeInTheDocument(),
    )
    expect(screen.getByText('2 × 1')).toBeInTheDocument()
  })

  it('não mostra o card de última partida quando não há histórico', async () => {
    clubesApi.listClubs.mockResolvedValue(CLUBS)
    ligaApi.listMatches.mockResolvedValue([])

    renderPage()

    await waitFor(() =>
      expect(
        screen.getByText('Nenhuma partida encontrada.'),
      ).toBeInTheDocument(),
    )
    expect(screen.queryByText('Última partida')).not.toBeInTheDocument()
  })

  it('carrega o histórico de partidas com filtro por clube', async () => {
    clubesApi.listClubs.mockResolvedValue(CLUBS)
    ligaApi.listMatches.mockResolvedValue(MATCHES)

    renderPage()
    await waitFor(() =>
      expect(screen.getByLabelText('Filtrar por clube')).toBeInTheDocument(),
    )

    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Filtrar por clube' }),
      'Clube A',
    )

    await waitFor(() =>
      expect(ligaApi.listMatches).toHaveBeenLastCalledWith('1'),
    )
  })

  it('mostra o histórico com link "Ver duelos" para a tela de detalhes de cada partida', async () => {
    clubesApi.listClubs.mockResolvedValue(CLUBS)
    ligaApi.listMatches.mockResolvedValue(MATCHES)

    renderPage()

    await waitFor(() =>
      expect(screen.getAllByText('2 x 1').length).toBeGreaterThan(0),
    )
    const links = screen.getAllByRole('link', { name: /Ver duelos/ })
    expect(links[0]).toHaveAttribute('href', '/partidas/1')
  })

  it('mostra botão "Tentar de novo" quando falha ao carregar o histórico de partidas, e recarrega ao clicar', async () => {
    const user = userEvent.setup()
    clubesApi.listClubs.mockResolvedValue(CLUBS)
    ligaApi.listMatches
      .mockRejectedValueOnce(new Error('Erro ao buscar partidas'))
      .mockResolvedValueOnce(MATCHES)

    renderPage()

    const retryButton = await screen.findByRole('button', {
      name: 'Tentar de novo',
    })
    await user.click(retryButton)

    await waitFor(() => expect(screen.getByText('2 × 1')).toBeInTheDocument())
    expect(ligaApi.listMatches).toHaveBeenCalledTimes(2)
  })

  it('mostra botão "Tentar de novo" quando falha ao carregar os clubes, e recarrega ao clicar', async () => {
    const user = userEvent.setup()
    clubesApi.listClubs
      .mockRejectedValueOnce(new Error('Erro ao buscar clubes'))
      .mockResolvedValueOnce(CLUBS)
    ligaApi.listMatches.mockResolvedValue([])

    renderPage()

    const retryButton = await screen.findByRole('button', {
      name: 'Tentar de novo',
    })
    await user.click(retryButton)

    await waitFor(() =>
      expect(screen.getByLabelText('Filtrar por clube')).toBeInTheDocument(),
    )
    expect(clubesApi.listClubs).toHaveBeenCalledTimes(2)
  })

  it('abre a modal de nova partida ao clicar no botão e cria a partida navegando para os duelos', async () => {
    const user = userEvent.setup()
    clubesApi.listClubs.mockResolvedValue(CLUBS)
    ligaApi.listMatches.mockResolvedValue([])
    ligaApi.createMatch.mockResolvedValue({
      id: 9,
      home: { club_id: 1, club_name: 'Clube A', goals: 2 },
      away: { club_id: 2, club_name: 'Clube B', goals: 1 },
      result: 'MANDANTE',
      duels: [],
    })
    ligaApi.getMatch.mockResolvedValue({
      id: 9,
      played_at: '2026-10-16T10:00:00-03:00',
      home: { club_id: 1, club_name: 'Clube A', goals: 2 },
      away: { club_id: 2, club_name: 'Clube B', goals: 1 },
      result: 'MANDANTE',
      duels: [],
    })

    renderPage()
    await waitFor(() =>
      expect(
        screen.getByText('Nenhuma partida encontrada.'),
      ).toBeInTheDocument(),
    )

    await user.click(screen.getByRole('button', { name: 'Nova partida' }))
    const dialog = within(screen.getByRole('dialog'))
    await user.selectOptions(
      dialog.getByRole('combobox', { name: 'Mandante' }),
      'Clube A',
    )
    await user.selectOptions(
      dialog.getByRole('combobox', { name: 'Visitante' }),
      'Clube B',
    )
    await user.click(dialog.getByRole('button', { name: /Jogar/ }))

    // navegou para a tela de duelos da partida criada
    await waitFor(() => expect(ligaApi.getMatch).toHaveBeenCalledWith('9'))
    await waitFor(() =>
      expect(
        screen.getByRole('link', { name: /Voltar para partidas/ }),
      ).toBeInTheDocument(),
    )
  })
})
