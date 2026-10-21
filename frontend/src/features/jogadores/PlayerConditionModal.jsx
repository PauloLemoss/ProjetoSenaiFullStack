import { useState } from 'react'
import { Modal } from '../../shared/Modal'
import { FormField } from '../../shared/FormField'
import { RadioOptionGroup } from '../../shared/RadioOptionGroup'
import { useAsyncAction } from '../../shared/useAsyncAction'
import { updatePlayerCondition } from './api'
import { CONDITIONS } from './constants'

const CONDITION_HELP = {
  APTO: 'Jogador está pronto para ser escalado normalmente.',
  MAL_CONDICIONADO:
    'Jogador pode ser escalado, mas não está no seu melhor momento.',
  DOENTE: 'Jogador não pode ser escalado como titular até se recuperar.',
}

/**
 * Alteração de condição física (F04): grupo de rádio com texto de ajuda por
 * opção (roeirotela.md, 2.3). A transição direta DOENTE → APTO é uma recusa
 * previsível (frontend-conventions) — a tela a impede aqui.
 */
export function PlayerConditionModal({ player, onClose, onUpdated }) {
  const [condition, setCondition] = useState(player.condition)
  const { run, isPending, errorMessage } = useAsyncAction((value) =>
    updatePlayerCondition(player.id, value),
  )

  const isDoenteToApto = player.condition === 'DOENTE' && condition === 'APTO'
  const options = CONDITIONS.map((item) => ({
    ...item,
    help: CONDITION_HELP[item.value],
  }))

  async function handleSubmit(event) {
    event.preventDefault()
    if (isDoenteToApto) return

    try {
      await run(condition)
      onUpdated()
      onClose()
    } catch {
      // o `message` da API fica disponível em errorMessage, mostrado abaixo
    }
  }

  return (
    <Modal
      title={`Alterar condição de ${player.name}`}
      onClose={onClose}
      error={errorMessage}
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="player-condition"
          label="Condição"
          error={
            isDoenteToApto
              ? 'Um jogador Doente não pode passar direto para Apto.'
              : undefined
          }
        >
          <RadioOptionGroup
            name="player-condition"
            ariaLabel="Condição"
            options={options}
            value={condition}
            onChange={setCondition}
          />
        </FormField>

        <div className="mt-5 flex flex-row-reverse gap-2">
          <button
            type="submit"
            disabled={isPending || isDoenteToApto}
            className="btn-primary"
          >
            {isPending ? 'Salvando…' : 'Salvar'}
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
