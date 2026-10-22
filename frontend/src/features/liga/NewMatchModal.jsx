import { useState } from 'react'
import { Modal } from '../../shared/Modal'
import { FormField } from '../../shared/FormField'
import { useAsyncAction } from '../../shared/useAsyncAction'
import { createMatch } from './api'

const EMPTY_FORM = {
  home_club_id: '',
  away_club_id: '',
}

function validateForm(form) {
  const errors = {}
  if (form.home_club_id === '' || form.home_club_id === undefined) {
    errors.home_club_id = 'Informe o mandante.'
  }
  if (form.away_club_id === '' || form.away_club_id === undefined) {
    errors.away_club_id = 'Informe o visitante.'
  }
  return errors
}

/**
 * Criação de partida (F13), em modal (roeirotela.md, 5.2): escolhe mandante
 * e visitante, ambos obrigatórios antes de habilitar o botão de jogar. Se um
 * dos clubes não tiver escalação completa, a API recusa com 409 — isso NÃO é
 * bloqueado na tela: o pedido é enviado normalmente e o message da API
 * aparece como banner de erro no topo da modal. Com sucesso, chama
 * `onCreated(match)` para o pai navegar para a tela de duelos da partida.
 */
export function NewMatchModal({ clubs, onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const { run, isPending, errorMessage } = useAsyncAction((payload) =>
    createMatch(payload),
  )

  function handleFieldChange(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  const formFilled = form.home_club_id !== '' && form.away_club_id !== ''
  const sameClub =
    form.home_club_id !== '' && form.home_club_id === form.away_club_id
  const displayError =
    errorMessage ||
    (sameClub ? 'O mandante e o visitante devem ser clubes diferentes.' : '')

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateForm(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0 || sameClub) return

    const payload = {
      home_club_id: Number(form.home_club_id),
      away_club_id: Number(form.away_club_id),
    }

    try {
      const match = await run(payload)
      onCreated(match)
    } catch {
      // o message da API fica disponível em errorMessage, mostrado no topo
    }
  }

  return (
    <Modal title="Nova partida" onClose={onClose} error={displayError}>
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="match-home-club"
          label="Mandante"
          error={errors.home_club_id}
        >
          <select
            id="match-home-club"
            className="input-field"
            value={form.home_club_id}
            onChange={(event) =>
              handleFieldChange('home_club_id', event.target.value)
            }
          >
            <option value="">Selecione o mandante</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          id="match-away-club"
          label="Visitante"
          error={errors.away_club_id}
        >
          <select
            id="match-away-club"
            className="input-field"
            value={form.away_club_id}
            onChange={(event) =>
              handleFieldChange('away_club_id', event.target.value)
            }
          >
            <option value="">Selecione o visitante</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
        </FormField>

        <div className="mt-5 flex flex-row-reverse gap-2">
          <button
            type="submit"
            disabled={isPending || !formFilled || sameClub}
            className="btn-primary"
          >
            {isPending ? 'Jogando…' : 'Jogar'}
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
