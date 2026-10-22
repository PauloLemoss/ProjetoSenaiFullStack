import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as ligaApi from './api'
import { NewMatchModal } from './NewMatchModal'

vi.mock('./api', () => ({
  createMatch: vi.fn(),
}))

const CLUBS = [
  { id: 1, name: 'Clube A' },
  { id: 2, name: 'Clube B' },
]

describe('NewMatchModal', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mostra os selects de mandante e visitante', () => {
    render(
      <NewMatchModal clubs={CLUBS} onClose={vi.fn()} onCreated={vi.fn()} />,
    )
    expect(screen.getByLabelText('Mandante')).toBeInTheDocument()
    expect(screen.getByLabelText('Visitante')).toBeInTheDocument()
  })

  it('desabilita o botão jogar quando formulário vazio, sem chamar a API', () => {
    render(
      <NewMatchModal clubs={CLUBS} onClose={vi.fn()} onCreated={vi.fn()} />,
    )
    expect(screen.getByRole('button', { name: /Jogar/ })).toBeDisabled()
    expect(ligaApi.createMatch).not.toHaveBeenCalled()
  })

  it('chama createMatch com os ids dos clubes e onCreated com o resultado', async () => {
    const user = userEvent.setup()
    const onCreated = vi.fn()
    const match = {
      id: 7,
      home: { club_id: 1, club_name: 'Clube A', goals: 2 },
      away: { club_id: 2, club_name: 'Clube B', goals: 1 },
      result: 'MANDANTE',
      duels: [],
    }
    ligaApi.createMatch.mockResolvedValue(match)
    render(
      <NewMatchModal clubs={CLUBS} onClose={vi.fn()} onCreated={onCreated} />,
    )

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Mandante' }),
      'Clube A',
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Visitante' }),
      'Clube B',
    )
    await user.click(screen.getByRole('button', { name: /Jogar/ }))

    expect(ligaApi.createMatch).toHaveBeenCalledWith({
      home_club_id: 1,
      away_club_id: 2,
    })
    expect(onCreated).toHaveBeenCalledWith(match)
  })

  it('mostra o message da API quando createMatch falha', async () => {
    const user = userEvent.setup()
    ligaApi.createMatch.mockRejectedValue({
      message: 'Erro na partida',
      status: 409,
    })
    render(
      <NewMatchModal clubs={CLUBS} onClose={vi.fn()} onCreated={vi.fn()} />,
    )

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Mandante' }),
      'Clube A',
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Visitante' }),
      'Clube B',
    )
    await user.click(screen.getByRole('button', { name: /Jogar/ }))

    expect(await screen.findByText('Erro na partida')).toBeInTheDocument()
  })

  it('impede mandante e visitante iguais, sem chamar a API', async () => {
    const user = userEvent.setup()
    render(
      <NewMatchModal clubs={CLUBS} onClose={vi.fn()} onCreated={vi.fn()} />,
    )

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Mandante' }),
      'Clube A',
    )
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Visitante' }),
      'Clube A',
    )

    expect(
      screen.getByText('O mandante e o visitante devem ser clubes diferentes.'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Jogar/ })).toBeDisabled()
    expect(ligaApi.createMatch).not.toHaveBeenCalled()
  })
})
