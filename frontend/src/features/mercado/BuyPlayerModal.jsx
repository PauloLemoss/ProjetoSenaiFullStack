import { useState } from 'react'
import { Modal } from '../../shared/Modal'
import { FormField } from '../../shared/FormField'
import { LockedField } from '../../shared/LockedField'
import { useAsyncAction } from '../../shared/useAsyncAction'
import { formatCurrency } from '../../lib/formatCurrency'
import {
  formatDateTime,
  parseDateTimeToBrasilia,
} from '../../lib/formatDateTime'
import { buyPlayer } from './api'

const EMPTY_FORM = {
  club_id: '',
  loyalty_date: '',
  loyalty_time: '',
}

function validateForm(form) {
  const errors = {}
  if (form.club_id === '' || form.club_id === undefined) {
    errors.club_id = 'Informe o clube.'
  }
  if (form.loyalty_date === '') {
    errors.loyalty_date = 'Informe a data.'
  }
  if (form.loyalty_time === '') {
    errors.loyalty_time = 'Informe a hora.'
  }
  return errors
}

/**
 * Compra de jogador livre (F06): mostra o valor de mercado (resumo
 * financeiro), escolhe o clube comprador (cada opção com o seu saldo em
 * caixa) e o fim da fidelidade em data e hora separadas, em horário de
 * Brasília, enviado no formato -03:00 (roeirotela.md, 4.1). Depois da compra
 * mostra valor, taxa, custo total (valor + taxa, somado na tela), fim da
 * fidelidade e o novo caixa do clube — tudo vindo da resposta da API.
 * Recusas de regra de negócio não são bloqueadas na tela: o pedido é
 * enviado normalmente e o message da API é mostrado.
 */
export function BuyPlayerModal({ player, clubs, onClose, onBought }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const { run, isPending, errorMessage, fieldErrors } = useAsyncAction(
    (payload) => buyPlayer(player.id, payload),
  )
  const [result, setResult] = useState(null)

  function handleFieldChange(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateForm(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const payload = {
      club_id: Number(form.club_id),
      loyalty_until: parseDateTimeToBrasilia(
        `${form.loyalty_date}T${form.loyalty_time}`,
      ),
    }

    try {
      const bought = await run(payload)
      setResult(bought)
      onBought()
    } catch {
      // o message da API fica disponível em errorMessage, mostrado abaixo;
      // os erros por campo ja estao em fieldErrors, renderizados ao lado de
      // cada FormField abaixo.
    }
  }

  const totalCost = result ? result.value + result.fee : null

  if (result) {
    return (
      <Modal
        title="Compra concluída"
        description={`${player.name} agora pertence ao clube selecionado.`}
        fields={[
          { label: 'Valor', value: formatCurrency(result.value) },
          { label: 'Taxa', value: formatCurrency(result.fee) },
          {
            label: 'Custo total',
            value: formatCurrency(totalCost),
          },
          {
            label: 'Fim da fidelidade',
            value: formatDateTime(result.contract.loyalty_until),
          },
          {
            label: 'Novo caixa do clube',
            value: formatCurrency(result.club_cash),
          },
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
      title={`Comprar ${player.name}`}
      onClose={onClose}
      error={errorMessage}
    >
      <form onSubmit={handleSubmit} noValidate>
        <LockedField
          label="Valor de mercado"
          value={formatCurrency(player.market_value)}
        />

        <FormField
          id="buy-club"
          label="Clube"
          error={fieldErrors.club_id ?? errors.club_id}
        >
          <select
            id="buy-club"
            className="input-field"
            value={form.club_id}
            onChange={(event) =>
              handleFieldChange('club_id', event.target.value)
            }
          >
            <option value="">Selecione o clube</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name} — Caixa: {formatCurrency(club.cash)}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="buy-loyalty-date"
            label="Fim da fidelidade (data)"
            error={fieldErrors.loyalty_until ?? errors.loyalty_date}
            hint="Horário de Brasília."
          >
            <input
              id="buy-loyalty-date"
              type="date"
              className="input-field"
              value={form.loyalty_date}
              onChange={(event) =>
                handleFieldChange('loyalty_date', event.target.value)
              }
            />
          </FormField>

          <FormField
            id="buy-loyalty-time"
            label="Fim da fidelidade (hora)"
            error={fieldErrors.loyalty_until ?? errors.loyalty_time}
          >
            <input
              id="buy-loyalty-time"
              type="time"
              className="input-field"
              value={form.loyalty_time}
              onChange={(event) =>
                handleFieldChange('loyalty_time', event.target.value)
              }
            />
          </FormField>
        </div>

        <div className="mt-5 flex flex-row-reverse gap-2">
          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? 'Comprando…' : 'Comprar'}
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
