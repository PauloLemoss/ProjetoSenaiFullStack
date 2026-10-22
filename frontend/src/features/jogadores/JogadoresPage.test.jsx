import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as playersApi from './api'
import * as clubsApi from '../clubes/api'
import * as mercadoApi from '../mercado/api'
import { JogadoresPage } from './JogadoresPage'

vi.mock('./api')
vi.mock('../clubes/api')
vi.mock('../mercado/api')

const PLAYER = {
  id: 1,
  name: 'João Silva',
  position: 'ATA',
  overall: 79,
  agility: 77,
  age: 24,
  condition: 'APTO',
  base_value: 64,
  market_value: 64,
  club_id: null,
}

function renderPage() {
  return render(
    <MemoryRouter>
      <JogadoresPage />
    </MemoryRouter>,
  )
}

describe('JogadoresPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mostra a tabela com o jogador e o total depois de carregar', async () => {
    clubsApi.listClubs.mockResolvedValue([])
    playersApi.listPlayers.mockResolvedValue({
      data: [PLAYER],
      meta: { total_items: 1, total_pages: 1, page: 1, limit: 10 },
    })

    renderPage()

    await waitFor(() =>
      expect(screen.getByText('João Silva')).toBeInTheDocument(),
    )
    expect(screen.getByText(/Página 1 de 1/i)).toBeInTheDocument()
  })

  it('bloqueia o cadastro com nome muito curto, sem chamar a API', async () => {
    const user = userEvent.setup()
    clubsApi.listClubs.mockResolvedValue([])
    playersApi.listPlayers.mockResolvedValue({
      data: [],
      meta: { total_items: 0, total_pages: 0, page: 1, limit: 10 },
    })

    renderPage()
    await waitFor(() =>
      expect(
        screen.getByText('Nenhum jogador encontrado.'),
      ).toBeInTheDocument(),
    )

    await user.click(screen.getByRole('button', { name: 'Novo jogador' }))
    await user.type(screen.getByLabelText('Nome'), 'Lu')
    await user.click(screen.getByRole('button', { name: 'Salvar' }))

    expect(
      screen.getByText('O nome deve ter de 3 a 100 caracteres.'),
    ).toBeInTheDocument()
    expect(playersApi.createPlayer).not.toHaveBeenCalled()
  })

  it('cadastra um jogador e mostra o valor base e o overall calculados pela API', async () => {
    const user = userEvent.setup()
    clubsApi.listClubs.mockResolvedValue([])
    playersApi.listPlayers.mockResolvedValue({
      data: [],
      meta: { total_items: 0, total_pages: 0, page: 1, limit: 10 },
    })
    playersApi.createPlayer.mockResolvedValue({
      ...PLAYER,
      base_value: 40,
      overall: 75,
    })

    renderPage()
    await waitFor(() =>
      expect(
        screen.getByText('Nenhum jogador encontrado.'),
      ).toBeInTheDocument(),
    )

    await user.click(screen.getByRole('button', { name: 'Novo jogador' }))
    const dialog = within(screen.getByRole('dialog'))
    await user.type(dialog.getByLabelText('Nome'), 'Novo Atacante')
    await user.click(dialog.getByRole('radio', { name: 'Atacante' }))
    await user.type(dialog.getByLabelText('Agilidade (1 a 100)'), '70')
    await user.type(dialog.getByLabelText('Idade (16 a 45)'), '25')
    for (const label of [
      'Velocidade (1 a 99)',
      'Finalização (1 a 99)',
      'Passe (1 a 99)',
      'Drible (1 a 99)',
      'Defesa (1 a 99)',
      'Físico (1 a 99)',
      'Potencial (teto de evolução, 1 a 99)',
    ]) {
      await user.type(dialog.getByLabelText(label), '70')
    }

    await user.click(dialog.getByRole('button', { name: 'Salvar' }))

    expect(await screen.findByText('Jogador cadastrado')).toBeInTheDocument()
    expect(screen.getByText('40,00')).toBeInTheDocument()
    expect(screen.getByText('75')).toBeInTheDocument()
  })

  it('compra um jogador livre e mostra valor, taxa, custo total, fim da fidelidade e novo caixa', async () => {
    const user = userEvent.setup()
    const clube = {
      id: 5,
      name: 'Clube Comprador',
      acronym: 'CCO',
      cash: 50000,
    }
    clubsApi.listClubs.mockResolvedValue([clube])
    playersApi.listPlayers.mockResolvedValue({
      data: [PLAYER],
      meta: { total_items: 1, total_pages: 1, page: 1, limit: 10 },
    })
    const buyResult = {
      value: 100000,
      fee: 10000,
      club_cash: 400000,
      contract: {
        purchase_value: 100000,
        loyalty_until: '2028-12-31T23:59:00-03:00',
        status: 'ATIVO',
      },
    }
    mercadoApi.buyPlayer.mockResolvedValue(buyResult)

    renderPage()

    await waitFor(() =>
      expect(screen.getByText('João Silva')).toBeInTheDocument(),
    )

    // "Comprar" fica dentro do menu "Mais ações" (kebab) da linha do jogador livre
    await user.click(screen.getByRole('button', { name: 'Mais ações' }))
    await user.click(screen.getByRole('button', { name: 'Comprar' }))

    const dialog = within(screen.getByRole('dialog'))
    await user.selectOptions(dialog.getByLabelText('Clube'), '5')
    await user.type(
      dialog.getByLabelText('Fim da fidelidade (data)'),
      '2028-12-31',
    )
    await user.type(dialog.getByLabelText('Fim da fidelidade (hora)'), '23:59')

    await user.click(dialog.getByRole('button', { name: 'Comprar' }))

    expect(
      await screen.findByText('Jogador comprado com sucesso.'),
    ).toBeInTheDocument()
    expect(screen.getByText('100.000,00')).toBeInTheDocument() // valor
    expect(screen.getByText('10.000,00')).toBeInTheDocument() // taxa
    expect(screen.getByText('110.000,00')).toBeInTheDocument() // custo total = valor + taxa
    expect(screen.getByText('31/12/2028 23:59')).toBeInTheDocument() // fim da fidelidade
    expect(screen.getByText('400.000,00')).toBeInTheDocument() // novo caixa
    expect(mercadoApi.buyPlayer).toHaveBeenCalledWith(1, {
      club_id: 5,
      loyalty_until: '2028-12-31T23:59-03:00',
    })
  })

  it('mostra as ações Editar e Excluir no menu do jogador livre', async () => {
    const user = userEvent.setup()
    clubsApi.listClubs.mockResolvedValue([])
    playersApi.listPlayers.mockResolvedValue({
      data: [PLAYER],
      meta: { total_items: 1, total_pages: 1, page: 1, limit: 10 },
    })

    renderPage()

    await waitFor(() =>
      expect(screen.getByText('João Silva')).toBeInTheDocument(),
    )
    await user.click(screen.getByRole('button', { name: 'Mais ações' }))
    expect(screen.getByRole('button', { name: 'Editar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Excluir' })).toBeInTheDocument()
  })

  it('abre o modal de edição ao clicar em Editar', async () => {
    const user = userEvent.setup()
    clubsApi.listClubs.mockResolvedValue([])
    playersApi.listPlayers.mockResolvedValue({
      data: [PLAYER],
      meta: { total_items: 1, total_pages: 1, page: 1, limit: 10 },
    })

    renderPage()

    await waitFor(() =>
      expect(screen.getByText('João Silva')).toBeInTheDocument(),
    )
    await user.click(screen.getByRole('button', { name: 'Mais ações' }))
    await user.click(screen.getByRole('button', { name: 'Editar' }))
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByLabelText('Nome')).toHaveValue('João Silva')
    expect(dialog.getByLabelText('Idade (16 a 45)')).toHaveValue(24)
  })

  it('mostra a ação Alterar condição no menu do jogador', async () => {
    const user = userEvent.setup()
    clubsApi.listClubs.mockResolvedValue([])
    playersApi.listPlayers.mockResolvedValue({
      data: [PLAYER],
      meta: { total_items: 1, total_pages: 1, page: 1, limit: 10 },
    })

    renderPage()

    await waitFor(() =>
      expect(screen.getByText('João Silva')).toBeInTheDocument(),
    )
    await user.click(screen.getByRole('button', { name: 'Mais ações' }))
    expect(
      screen.getByRole('button', { name: 'Alterar condição' }),
    ).toBeInTheDocument()
  })

  it('abre o modal de condição ao clicar em Alterar condição', async () => {
    const user = userEvent.setup()
    clubsApi.listClubs.mockResolvedValue([])
    playersApi.listPlayers.mockResolvedValue({
      data: [PLAYER],
      meta: { total_items: 1, total_pages: 1, page: 1, limit: 10 },
    })

    renderPage()

    await waitFor(() =>
      expect(screen.getByText('João Silva')).toBeInTheDocument(),
    )
    await user.click(screen.getByRole('button', { name: 'Mais ações' }))
    await user.click(screen.getByRole('button', { name: 'Alterar condição' }))
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByRole('radio', { name: 'Apto' })).toBeChecked()
  })
})
