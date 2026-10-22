import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import * as playersApi from '../jogadores/api'
import * as clubesApi from '../clubes/api'
import { HomePage } from './HomePage'

vi.mock('../jogadores/api')
vi.mock('../clubes/api')
vi.mock('../liga/api', () => ({
  listMatches: vi.fn().mockResolvedValue([]),
  getStandings: vi.fn().mockResolvedValue([]),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
}

describe('HomePage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mostra a contagem de jogadores vinda de meta.total_items da API', async () => {
    playersApi.listPlayers.mockResolvedValue({
      data: [],
      meta: { total_items: 42, total_pages: 5, page: 1, limit: 10 },
    })
    clubesApi.listClubs.mockResolvedValue([])

    renderPage()

    await waitFor(() => expect(screen.getByText('42')).toBeInTheDocument())
    expect(playersApi.listPlayers).toHaveBeenCalled()
  })

  it('mostra a contagem de clubes vinda da quantidade de itens da lista da API', async () => {
    playersApi.listPlayers.mockResolvedValue({
      data: [],
      meta: { total_items: 0, total_pages: 0, page: 1, limit: 10 },
    })
    clubesApi.listClubs.mockResolvedValue([
      { id: 1, name: 'Clube A', acronym: 'CLA' },
      { id: 2, name: 'Clube B', acronym: 'CLB' },
      { id: 3, name: 'Clube C', acronym: 'CLC' },
    ])

    renderPage()

    await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument())
    expect(clubesApi.listClubs).toHaveBeenCalled()
  })

  it('exibe o hero Passe, o botao Iniciar e os 6 cartoes das etapas do sistema', async () => {
    playersApi.listPlayers.mockResolvedValue({
      data: [],
      meta: { total_items: 0, total_pages: 0, page: 1, limit: 10 },
    })
    clubesApi.listClubs.mockResolvedValue([])

    renderPage()

    expect(
      screen.getByRole('heading', {
        name: 'Gestão da liga, do mercado à classificação',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Iniciar/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enter' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /01[\s\S]*Jogadores/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /06[\s\S]*Liga/ }),
    ).toBeInTheDocument()
  })
})
