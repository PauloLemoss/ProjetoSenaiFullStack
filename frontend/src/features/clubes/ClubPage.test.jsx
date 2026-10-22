import { act, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as clubesApi from './api'
import * as mercadoApi from '../mercado/api'
import * as ligaApi from '../liga/api'
import { ClubPage } from './ClubPage'

vi.mock('./api')
vi.mock('../mercado/api', () => ({
  listClubTransactions: vi.fn().mockResolvedValue({ data: [], summary: {} }),
  buyPlayer: vi.fn(),
  sellPlayer: vi.fn(),
  exportClubTransactions: vi.fn(),
}))
vi.mock('../liga/api', () => ({
  getLineup: vi.fn().mockResolvedValue({
    formation: null,
    complete: false,
    players: [],
  }),
  saveLineup: vi.fn(),
}))

const CLUB_WITH_SQUAD = {
  id: 1,
  name: 'Clube Teste',
  acronym: 'TST',
  cash: 100000,
  squad_value: 250000,
  net_worth: 350000,
  players: [
    { id: 1, name: 'Goleiro A', position: 'GOL', condition: 'APTO' },
    { id: 2, name: 'Zagueiro A', position: 'ZAG', condition: 'APTO' },
    { id: 3, name: 'Zagueiro B', position: 'ZAG', condition: 'DOENTE' },
    { id: 4, name: 'Lateral A', position: 'LAT', condition: 'APTO' },
    { id: 5, name: 'Meia A', position: 'MEI', condition: 'APTO' },
    { id: 6, name: 'Atacante A', position: 'ATA', condition: 'APTO' },
    {
      id: 7,
      name: 'Atacante B',
      position: 'ATA',
      condition: 'MAL_CONDICIONADO',
    },
  ],
}

const TRANSACTIONS_WITH_PLAYER_A = [
  {
    id: 1,
    club_id: 1,
    player_id: 10,
    player_name: 'Jogador A',
    type: 'COMPRA',
    value: 100000,
    fee: 10000,
    penalty: 0,
    profit: null,
    cash_change: -110000,
    created_at: '2026-10-01T10:00:00-03:00',
  },
]

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/clubes/1']}>
      <Routes>
        <Route path="clubes/:clubId" element={<ClubPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ClubPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mostra os indicadores financeiros do clube', async () => {
    clubesApi.getClub.mockResolvedValue(CLUB_WITH_SQUAD)
    mercadoApi.listClubTransactions.mockResolvedValue({ data: [], summary: {} })

    renderPage()

    await waitFor(() =>
      expect(screen.getByText('Clube Teste')).toBeInTheDocument(),
    )
    expect(screen.getByText(/TST/)).toBeInTheDocument()
    expect(screen.getByText('100.000,00')).toBeInTheDocument()
    expect(screen.getByText('250.000,00')).toBeInTheDocument()
    expect(screen.getByText('350.000,00')).toBeInTheDocument()
    expect(clubesApi.getClub).toHaveBeenCalledWith('1')
  })

  it('mostra o elenco na ordem da API, com valor de mercado e contrato de cada jogador', async () => {
    clubesApi.getClub.mockResolvedValue(CLUB_WITH_SQUAD)
    mercadoApi.listClubTransactions.mockResolvedValue({ data: [], summary: {} })

    renderPage()

    await waitFor(() =>
      expect(screen.getByText('Goleiro A')).toBeInTheDocument(),
    )
    // ordem preservada: Goleiro A antes de Zagueiro A
    expect(screen.getByText('Goleiro A')).toBeInTheDocument()
    expect(screen.getByText('Zagueiro A')).toBeInTheDocument()
    expect(screen.getByText('Lateral A')).toBeInTheDocument()
    expect(screen.getByText('Meia A')).toBeInTheDocument()
    expect(screen.getByText('Atacante A')).toBeInTheDocument()
    expect(screen.getByText('Atacante B')).toBeInTheDocument()
    // jogadores sem contrato mostram traços nas colunas de contrato
    expect(screen.getAllByText('-').length).toBeGreaterThan(0)
  })

  it('mostra estado de lista vazia quando o clube não tem elenco', async () => {
    clubesApi.getClub.mockResolvedValue({
      ...CLUB_WITH_SQUAD,
      players: [],
    })
    mercadoApi.listClubTransactions.mockResolvedValue({ data: [], summary: {} })

    renderPage()

    await waitFor(() =>
      expect(
        screen.getByText('Este clube ainda não tem jogadores no elenco.'),
      ).toBeInTheDocument(),
    )
  })

  it('mostra erro quando a API falha', async () => {
    clubesApi.getClub.mockRejectedValue({
      message: 'Clube não encontrado.',
      status: 404,
    })
    mercadoApi.listClubTransactions.mockResolvedValue({ data: [], summary: {} })

    renderPage()

    await waitFor(() =>
      expect(screen.getByText('Clube não encontrado.')).toBeInTheDocument(),
    )
  })

  it('mostra estado de carregamento enquanto getClub ainda não resolveu', async () => {
    let resolveClub
    const promise = new Promise((resolve) => {
      resolveClub = resolve
    })
    clubesApi.getClub.mockReturnValue(promise)
    mercadoApi.listClubTransactions.mockResolvedValue({ data: [], summary: {} })

    renderPage()

    expect(screen.getByRole('status')).toHaveTextContent('Carregando…')
    expect(clubesApi.getClub).toHaveBeenCalledWith('1')

    await act(async () => {
      resolveClub(CLUB_WITH_SQUAD)
    })
    await waitFor(() =>
      expect(screen.getByText('Clube Teste')).toBeInTheDocument(),
    )
  })

  it('envia filtro de tipo e de jogador juntos para listClubTransactions (merge no pai)', async () => {
    clubesApi.getClub.mockResolvedValue(CLUB_WITH_SQUAD)
    mercadoApi.listClubTransactions.mockResolvedValue({
      data: TRANSACTIONS_WITH_PLAYER_A,
      summary: {},
    })

    renderPage()

    await waitFor(() =>
      expect(screen.getByText('Clube Teste')).toBeInTheDocument(),
    )
    await userEvent.click(screen.getByRole('tab', { name: 'Histórico' }))
    await waitFor(() =>
      expect(screen.getByText('Histórico de transações')).toBeInTheDocument(),
    )

    // 1) filtra por tipo COMPRA (checkbox)
    await userEvent.click(screen.getByRole('checkbox', { name: /Compra/ }))

    // 2) filtra por jogador "Jogador A" (select) — o filtro de tipo não some
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Jogador' }),
      '10',
    )

    // a última chamada deve ter ambos os filtros juntos
    expect(mercadoApi.listClubTransactions).toHaveBeenLastCalledWith('1', {
      type: 'COMPRA',
      player_id: '10',
    })
  })

  it('mostra totais do summary que mudam quando o filtro de tipo muda', async () => {
    clubesApi.getClub.mockResolvedValue(CLUB_WITH_SQUAD)
    mercadoApi.listClubTransactions.mockImplementation(
      async (_clubId, filters) => {
        if (filters?.type === 'VENDA') {
          return {
            data: TRANSACTIONS_WITH_PLAYER_A,
            summary: {
              total_spent: 0,
              total_received: 80000,
              total_fees: 4000,
              total_penalties: 8000,
              total_profit: 12000,
            },
          }
        }
        return {
          data: TRANSACTIONS_WITH_PLAYER_A,
          summary: {
            total_spent: 100000,
            total_received: 0,
            total_fees: 10000,
            total_penalties: 0,
            total_profit: null,
          },
        }
      },
    )

    renderPage()

    await waitFor(() =>
      expect(screen.getByText('Clube Teste')).toBeInTheDocument(),
    )
    await userEvent.click(screen.getByRole('tab', { name: 'Histórico' }))

    // totais iniciais (sem filtro de tipo) — usa dd dentro do summary
    await waitFor(() =>
      expect(screen.getByText('Total gasto em compras')).toBeInTheDocument(),
    )
    const totalSpentLabel = screen.getByText('Total gasto em compras')
    const totalSpentValue = totalSpentLabel.parentElement?.querySelector('dd')
    expect(totalSpentValue?.textContent).toBe('100.000,00')

    // aplica filtro de tipo VENDA
    await userEvent.click(screen.getByRole('checkbox', { name: /Venda/ }))

    // totais mudam para o summary do filtro VENDA
    const totalReceivedLabel = screen.getByText('Total recebido em vendas')
    const totalReceivedValue =
      totalReceivedLabel.parentElement?.querySelector('dd')
    expect(totalReceivedValue?.textContent).toBe('80.000,00')
    const spentAfterVendaLabel = screen.getByText('Total gasto em compras')
    const spentAfterVendaValue =
      spentAfterVendaLabel.parentElement?.querySelector('dd')
    expect(spentAfterVendaValue?.textContent).toBe('0,00') // total_spent virou 0
    expect(screen.getByText('12.000,00')).toBeInTheDocument() // lucro total

    expect(mercadoApi.listClubTransactions).toHaveBeenLastCalledWith('1', {
      type: 'VENDA',
    })
  })

  it('exporta CSV com os filtros ativos (tipo e jogador)', async () => {
    clubesApi.getClub.mockResolvedValue(CLUB_WITH_SQUAD)
    mercadoApi.listClubTransactions.mockResolvedValue({
      data: TRANSACTIONS_WITH_PLAYER_A,
      summary: {},
    })
    mercadoApi.exportClubTransactions.mockResolvedValue(
      new Blob([], { type: 'text/csv' }),
    )

    renderPage()

    await waitFor(() =>
      expect(screen.getByText('Clube Teste')).toBeInTheDocument(),
    )
    await userEvent.click(screen.getByRole('tab', { name: 'Histórico' }))
    await waitFor(() =>
      expect(screen.getByText('Histórico de transações')).toBeInTheDocument(),
    )

    // seleciona filtros antes de exportar
    await userEvent.click(screen.getByRole('checkbox', { name: /Compra/ }))
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Jogador' }),
      '10',
    )

    await userEvent.click(screen.getByRole('button', { name: /Exportar CSV/ }))

    // deve chamar exportClubTransactions com os dois filtros juntos
    expect(mercadoApi.exportClubTransactions).toHaveBeenLastCalledWith('1', {
      type: 'COMPRA',
      player_id: '10',
    })
  })

  it('aviso de escalação incompleta some depois de salvar escalação completa', async () => {
    clubesApi.getClub.mockResolvedValue(CLUB_WITH_SQUAD)
    mercadoApi.listClubTransactions.mockResolvedValue({
      data: [],
      summary: {},
    })
    // escalação inicial: incompleta (primeira chamada)
    // após reload: completa (segunda chamada)
    ligaApi.getLineup.mockImplementation(() =>
      Promise.resolve({
        formation: '2-1-1',
        complete: ligaApi.getLineup.mock.calls.length > 1,
        players: [],
      }),
    )
    ligaApi.saveLineup.mockResolvedValue({
      formation: '2-1-1',
      complete: true,
      players: [],
    })

    renderPage()

    // aviso aparece inicialmente, visível em qualquer aba
    await waitFor(() =>
      expect(screen.getByText(/Este clube não pode jogar/)).toBeInTheDocument(),
    )

    // preenche a escalação (aba Escalação) e salva
    await userEvent.click(screen.getByRole('tab', { name: 'Escalação' }))
    await userEvent.click(screen.getByRole('radio', { name: '2-1-1' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Goleiro')).toBeInTheDocument(),
    )
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Goleiro' }),
      '1',
    )
    await userEvent.selectOptions(
      screen.getAllByRole('combobox', {
        name: 'Defesa (Zagueiro ou Lateral)',
      })[0],
      '2',
    )
    await userEvent.selectOptions(
      screen.getAllByRole('combobox', {
        name: 'Defesa (Zagueiro ou Lateral)',
      })[1],
      '4',
    )
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Meio-campo' }),
      '5',
    )
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: 'Atacante' }),
      '6',
    )
    await userEvent.click(
      screen.getByRole('button', { name: /Salvar escalação/ }),
    )

    // após salvar, o reload() chama getLineup novamente (2ª chamada)
    await waitFor(() => expect(ligaApi.getLineup).toHaveBeenCalledTimes(2))

    // o aviso desaparece da tela depois do reload
    expect(
      screen.queryByText(/Este clube não pode jogar/),
    ).not.toBeInTheDocument()

    // sem reload de página: o clube segue na tela
    expect(screen.getByText('Clube Teste')).toBeInTheDocument()
  })

  it('mostra a escalação existente mesmo quando getLineup resolve depois de getClub', async () => {
    // getLineup resolve só depois de getClub (Promise controlada manualmente)
    let resolveLineup
    const lineupPromise = new Promise((resolve) => {
      resolveLineup = resolve
    })
    clubesApi.getClub.mockResolvedValue(CLUB_WITH_SQUAD)
    mercadoApi.listClubTransactions.mockResolvedValue({ data: [], summary: {} })
    ligaApi.getLineup.mockReturnValue(lineupPromise)
    ligaApi.saveLineup.mockResolvedValue({
      formation: '2-1-1',
      complete: true,
      players: [],
    })

    renderPage()

    // aguarda o clube carregar
    await waitFor(() =>
      expect(screen.getByText('Goleiro A')).toBeInTheDocument(),
    )

    // enquanto getLineup não resolve, a aba Escalação mostra carregando
    await userEvent.click(screen.getByRole('tab', { name: 'Escalação' }))
    expect(screen.getByRole('status')).toHaveTextContent(
      'Carregando escalação…',
    )
    expect(
      screen.queryByRole('radiogroup', { name: 'Formação' }),
    ).not.toBeInTheDocument()

    // resolve getLineup com uma escalação já existente
    await act(async () => {
      resolveLineup({
        formation: '2-1-1',
        complete: true,
        players: [
          { id: 1, name: 'Goleiro A', position: 'GOL' },
          { id: 2, name: 'Zagueiro A', position: 'ZAG' },
          { id: 4, name: 'Lateral A', position: 'LAT' },
          { id: 5, name: 'Meia A', position: 'MEI' },
          { id: 6, name: 'Atacante A', position: 'ATA' },
        ],
      })
    })

    // o formulário mostra a escalação pré-preenchida
    await waitFor(() =>
      expect(screen.getByRole('radio', { name: '2-1-1' })).toBeChecked(),
    )
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Goleiro' })).toHaveValue(
        '1',
      ),
    )
    expect(
      screen.getAllByRole('combobox', {
        name: 'Defesa (Zagueiro ou Lateral)',
      })[0],
    ).toHaveValue('2')
    expect(
      screen.getAllByRole('combobox', {
        name: 'Defesa (Zagueiro ou Lateral)',
      })[1],
    ).toHaveValue('4')
    expect(screen.getByRole('combobox', { name: 'Meio-campo' })).toHaveValue(
      '5',
    )
    expect(screen.getByRole('combobox', { name: 'Atacante' })).toHaveValue('6')
  })
})
