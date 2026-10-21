import { useState } from 'react'
import { Modal } from '../../shared/Modal'
import { FormField } from '../../shared/FormField'
import { ToggleButtonGroup } from '../../shared/ToggleButtonGroup'
import { LockedField } from '../../shared/LockedField'
import { useAsyncAction } from '../../shared/useAsyncAction'
import { formatCurrency } from '../../lib/formatCurrency'
import { updatePlayer } from './api'
import { POSITIONS } from './constants'
import {
  validateAge,
  validateAgility,
  validatePlayerName,
  validateRequired,
} from './validation'

/**
 * Edição de jogador (F04): só nome, posição, agilidade e idade são
 * editáveis. Posição como toggles (roeirotela.md, 2.2); valor base e overall
 * aparecem bloqueados (já calculados pela API). Mudar a posição de um
 * jogador com clube e diminuir a idade são recusas previsíveis
 * (frontend-conventions) — a tela as impede aqui.
 */
export function PlayerEditModal({ player, onClose, onUpdated }) {
  const [form, setForm] = useState({
    name: player.name,
    position: player.position,
    agility: player.agility,
    age: player.age,
  })
  const [errors, setErrors] = useState({})
  const { run, isPending, errorMessage, fieldErrors } = useAsyncAction(
    (payload) => updatePlayer(player.id, payload),
  )

  const hasClub = player.club_id !== null

  function handleFieldChange(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  function validateForm() {
    const nextErrors = {}
    const nameError = validatePlayerName(form.name)
    if (nameError) nextErrors.name = nameError
    const positionError = validateRequired(form.position, 'a posição')
    if (positionError) nextErrors.position = positionError
    const agilityError = validateAgility(form.agility)
    if (agilityError) nextErrors.agility = agilityError
    const ageError = validateAge(form.age)
    if (ageError) nextErrors.age = ageError
    else if (Number(form.age) < player.age) {
      nextErrors.age = `A idade não pode ser menor que a atual (${player.age}).`
    }
    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateForm()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    try {
      await run({
        name: form.name.trim(),
        position: form.position,
        agility: Number(form.agility),
        age: Number(form.age),
      })
      onUpdated()
      onClose()
    } catch {
      // o `message` da API fica disponível em errorMessage, mostrado abaixo
    }
  }

  return (
    <Modal
      title={`Editar ${player.name}`}
      onClose={onClose}
      error={errorMessage}
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="edit-player-name"
          label="Nome"
          error={fieldErrors.name ?? errors.name}
        >
          <input
            id="edit-player-name"
            className="input-field"
            value={form.name}
            onChange={(event) => handleFieldChange('name', event.target.value)}
          />
        </FormField>

        <FormField
          id="edit-player-position"
          label="Posição"
          error={fieldErrors.position ?? errors.position}
          hint={
            hasClub
              ? 'Jogador tem clube: a posição não pode ser alterada.'
              : undefined
          }
        >
          <ToggleButtonGroup
            name="edit-player-position"
            ariaLabel="Posição"
            options={POSITIONS}
            value={form.position}
            disabled={hasClub}
            onChange={(value) => handleFieldChange('position', value)}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="edit-player-age"
            label="Idade (16 a 45)"
            error={fieldErrors.age ?? errors.age}
          >
            <input
              id="edit-player-age"
              type="number"
              className="input-field"
              value={form.age}
              onChange={(event) => handleFieldChange('age', event.target.value)}
            />
          </FormField>

          <FormField
            id="edit-player-agility"
            label="Agilidade (1 a 100)"
            error={fieldErrors.agility ?? errors.agility}
          >
            <input
              id="edit-player-agility"
              type="number"
              className="input-field"
              value={form.agility}
              onChange={(event) =>
                handleFieldChange('agility', event.target.value)
              }
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-3 mt-1 border-t border-border">
          <LockedField
            label="Valor base"
            value={formatCurrency(player.base_value)}
          />
          <LockedField label="Overall" value={player.overall} />
        </div>

        <div className="mt-5 flex flex-row-reverse gap-2">
          <button type="submit" disabled={isPending} className="btn-primary">
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
