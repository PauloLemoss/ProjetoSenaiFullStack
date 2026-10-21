import { useState } from 'react'
import { Modal } from '../../shared/Modal'
import { LockedField } from '../../shared/LockedField'
import { useAsyncAction } from '../../shared/useAsyncAction'
import { formatCurrency } from '../../lib/formatCurrency'
import { sellPlayer } from './api'

/**
 * Venda de jogador do elenco (F08): mostra um resumo financeiro (valor de
 * mercado, % de multa e dias restantes de fidelidade, já conhecidos pelo
 * contrato do jogador) antes de confirmar (roeirotela.md, 4.1 "Resumo
 * Financeiro"). Depois da venda mostra valor de compra, valor de venda, dias
 * restantes, multa, lucro, comissão, crédito e o novo caixa do clube — tudo
 * vindo da resposta do POST. Recusa de regra de negócio não é bloqueada na
 * tela: o pedido é enviado normalmente e o message da API é mostrado.
 */
export function SellPlayerModal({ player, onClose, onSold }) {
  const { run, isPending, errorMessage } = useAsyncAction(() =>
    sellPlayer(player.id),
  )
  const [result, setResult] = useState(null)

  async function handleConfirm() {
    try {
      const sold = await run()
      setResult(sold)
      onSold()
    } catch {
      // o message da API fica disponível em errorMessage, mostrado abaixo
    }
  }

  const profit = result ? result.profit : null
  const commission = result ? result.fee : null
  const credit = result ? formatCurrency(result.cash_change) : null

  if (result) {
    const contractLabel =
      result.contract_status === 'ENCERRADO'
        ? 'Contrato encerrado (fidelidade cumprida)'
        : 'Contrato rescindido (fidelidade pendente)'
    return (
      <Modal
        title="Venda concluída"
        description={`${player.name} foi vendido.`}
        fields={[
          {
            label: 'Valor de compra',
            value: formatCurrency(result.purchase_value),
          },
          { label: 'Valor de venda', value: formatCurrency(result.value) },
          { label: 'Dias restantes', value: String(result.remaining_days) },
          {
            label: 'Multa',
            value: formatCurrency(result.penalty),
          },
          { label: 'Lucro', value: formatCurrency(profit) },
          { label: 'Comissão', value: formatCurrency(commission) },
          { label: 'Crédito', value: credit },
          {
            label: 'Novo caixa do clube',
            value: formatCurrency(result.club_cash),
          },
          { label: 'Situação do contrato', value: contractLabel },
        ]}
        actions={
          <button type="button" onClick={onClose}>
            Fechar
          </button>
        }
        onClose={onClose}
      />
    )
  }

  return (
    <Modal
      title={`Vender ${player.name}`}
      onClose={onClose}
      error={errorMessage}
    >
      <form onSubmit={(event) => event.preventDefault()} noValidate>
        <p className="mb-3">
          Confirma a venda de {player.name}? O jogador sairá do elenco e o valor
          líquido será creditado ao caixa do clube.
        </p>

        <div className="grid grid-cols-3 gap-2">
          <LockedField
            label="Valor de mercado"
            value={formatCurrency(player.market_value)}
          />
          <LockedField
            label="% de multa"
            value={player.contract ? `${player.contract.penalty_rate}%` : '-'}
          />
          <LockedField
            label="Dias restantes"
            value={player.contract ? player.contract.remaining_days : '-'}
          />
        </div>

        <div className="mt-5 flex flex-row-reverse gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="btn-primary"
          >
            {isPending ? 'Vendendo…' : 'Vender'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="btn-secondary"
          >
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  )
}
