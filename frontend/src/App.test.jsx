import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./features/jogadores/api', () => ({
  listPlayers: vi.fn().mockResolvedValue({
    data: [],
    meta: { total_items: 0, total_pages: 0, page: 1, limit: 10 },
  }),
}))

vi.mock('./features/clubes/api', () => ({
  listClubs: vi.fn().mockResolvedValue([]),
}))

vi.mock('./features/liga/api', () => ({
  listMatches: vi.fn().mockResolvedValue([]),
  getStandings: vi.fn().mockResolvedValue([]),
}))

describe('App', () => {
  it('renderiza a tela inicial na raiz, sem redirecionar para /jogadores', async () => {
    render(<App />)

    await waitFor(() =>
      expect(
        screen.getByRole('heading', {
          name: 'Gestão da liga, do mercado à classificação',
        }),
      ).toBeInTheDocument(),
    )
    expect(screen.getByRole('link', { name: 'Clubes' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Partidas' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Classificação' }),
    ).toBeInTheDocument()
  })

  it('mostra os cartões numerados das etapas e o botão Iniciar', async () => {
    render(<App />)

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /Iniciar/ }),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getByRole('button', { name: /01[\s\S]*Jogadores/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /02[\s\S]*Clubes/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /06[\s\S]*Liga/ }),
    ).toBeInTheDocument()
  })

  it('navega para /jogadores ao clicar no cartão Jogadores, sem recarregar a página', async () => {
    render(<App />)

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /01[\s\S]*Jogadores/ }),
      ).toBeInTheDocument(),
    )
    await userEvent.click(
      screen.getByRole('button', { name: /01[\s\S]*Jogadores/ }),
    )

    await waitFor(() =>
      expect(
        screen.getByRole('heading', { name: 'Jogadores' }),
      ).toBeInTheDocument(),
    )
  })
})
