import { Modal } from '../../shared/Modal'
import { useAsyncAction } from '../../shared/useAsyncAction'
import { deletePlayer } from './api'

/** Excluir jogador livre, com confirmação (F03). */
export function DeletePlayerModal({ player, onClose, onDeleted }) {
  const { run, isPending, errorMessage } = useAsyncAction(() =>
    deletePlayer(player.id),
  )

  async function handleConfirm() {
    try {
      await run()
      onDeleted()
      onClose()
    } catch {
      // o `message` da API fica disponível em errorMessage, mostrado abaixo
    }
  }

  return (
    <Modal
      title="Excluir jogador"
      description={`Tem certeza que deseja excluir ${player.name}? Esta ação não pode ser desfeita.`}
      onClose={onClose}
      error={errorMessage}
      actions={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="btn-danger"
          >
            {isPending ? 'Excluindo…' : 'Excluir'}
          </button>
        </>
      }
    />
  )
}
