import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as mercadoApi from './api'
import { SellPlayerModal } from './SellPlayerModal'

vi.mock('./api')

const PLAYER_WITH_CONTRACT = {
  id: 10,
  name: 'Jogador Com Contrato',
  position: 'ATA',
  condition: 'APTO',
  market_value: 80000,
  contract: {
    purchase_value: 60000,
    loyalty_until: '2027-12-31T23:59:00-03:00',
    remaining_days: 500,
    penalty_rate: 10,
  },
}

function renderModal() {
  return render(
    <SellPlayerModal
      player={PLAYER_WITH_CONTRACT}
      onClose={vi.fn()}
      onSold={vi.fn()}
    />,
  )
}

describe('SellPlayerModal', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mostra o resultado completo da venda com multa (contrato RESCINDIDO)', async () => {
    const user = userEvent.setup()
    const onSold = vi.fn()
    mercadoApi.sellPlayer.mockResolvedValue({
      purchase_value: 60000,
      value: 80000,
      remaining_days: 500,
      penalty: 8000,
      profit: 12000,
      fee: 4000,
      cash_change: 68000,
      club_cash: 412000,
      contract_status: 'RESCINDIDO',
    })

    render(
      <SellPlayerModal
        player={PLAYER_WITH_CONTRACT}
        onClose={vi.fn()}
        onSold={onSold}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Vender' }))

    expect(await screen.findByText('Venda concluída')).toBeInTheDocument()
    expect(screen.getByText('60.000,00')).toBeInTheDocument() // valor de compra
    expect(screen.getByText('80.000,00')).toBeInTheDocument() // valor de venda
    expect(screen.getByText('500')).toBeInTheDocument() // dias restantes
    expect(screen.getByText('8.000,00')).toBeInTheDocument() // multa
    expect(screen.getByText('12.000,00')).toBeInTheDocument() // lucro
    expect(screen.getByText('4.000,00')).toBeInTheDocument() // comissão
    expect(screen.getByText('68.000,00')).toBeInTheDocument() // crédito (cash_change da API)
    expect(screen.getByText('412.000,00')).toBeInTheDocument() // novo caixa
    expect(
      screen.getByText('Contrato rescindido (fidelidade pendente)'),
    ).toBeInTheDocument()
    expect(mercadoApi.sellPlayer).toHaveBeenCalledWith(10)
    expect(onSold).toHaveBeenCalledTimes(1)
  })

  it('mostra multa 0,00 e contrato encerrado quando a fidelidade já foi cumprida', async () => {
    const user = userEvent.setup()
    mercadoApi.sellPlayer.mockResolvedValue({
      purchase_value: 60000,
      value: 80000,
      remaining_days: 0,
      penalty: 0,
      profit: 20000,
      fee: 4000,
      cash_change: 76000,
      club_cash: 420000,
      contract_status: 'ENCERRADO',
    })

    renderModal()

    await user.click(screen.getByRole('button', { name: 'Vender' }))

    expect(await screen.findByText('Venda concluída')).toBeInTheDocument()
    expect(screen.getByText('0,00')).toBeInTheDocument() // multa zero
    expect(screen.getByText('20.000,00')).toBeInTheDocument() // lucro
    expect(screen.getByText('76.000,00')).toBeInTheDocument() // crédito (cash_change da API)
    expect(
      screen.getByText('Contrato encerrado (fidelidade cumprida)'),
    ).toBeInTheDocument()
    expect(mercadoApi.sellPlayer).toHaveBeenCalledWith(10)
  })

  it('mostra o message da API quando a venda é recusada, sem mensagem genérica', async () => {
    const user = userEvent.setup()
    mercadoApi.sellPlayer.mockRejectedValue({
      message: 'Jogador não pertence a nenhum clube.',
      status: 409,
    })

    renderModal()

    await user.click(screen.getByRole('button', { name: 'Vender' }))

    expect(
      await screen.findByText('Jogador não pertence a nenhum clube.'),
    ).toBeInTheDocument()
    expect(mercadoApi.sellPlayer).toHaveBeenCalledWith(10)
  })
})
