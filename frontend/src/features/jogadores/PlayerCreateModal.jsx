import { useState } from 'react'
import { Modal } from '../../shared/Modal'
import { FormField } from '../../shared/FormField'
import { ToggleButtonGroup } from '../../shared/ToggleButtonGroup'
import { ProgressBar } from '../../shared/ProgressBar'
import { LockedField } from '../../shared/LockedField'
import { useAsyncAction } from '../../shared/useAsyncAction'
import { formatCurrency } from '../../lib/formatCurrency'
import { createPlayer } from './api'
import { POSITIONS } from './constants'
import {
  validateAge,
  validateAgility,
  validateAttribute,
  validatePlayerName,
  validateRequired,
} from './validation'

const TECHNICAL_ATTRIBUTE_FIELDS = [
  { key: 'pace', label: 'Velocidade' },
  { key: 'shooting', label: 'Finalização' },
  { key: 'passing', label: 'Passe' },
  { key: 'dribbling', label: 'Drible' },
  { key: 'defending', label: 'Defesa' },
  { key: 'physical', label: 'Físico' },
]

const POTENTIAL_FIELD = { key: 'potential', label: 'Potencial' }

/** Usada para validar e montar o payload — potencial é um campo à parte dos
 * seis atributos técnicos (roeirotela.md, 2.2 "Atributos Técnicos" vs.
 * "Potencial" são linhas separadas da tabela). */
const ATTRIBUTE_FIELDS = [...TECHNICAL_ATTRIBUTE_FIELDS, POTENTIAL_FIELD]

const EMPTY_FORM = {
  name: '',
  position: '',
  agility: '',
  age: '',
  pace: '',
  shooting: '',
  passing: '',
  dribbling: '',
  defending: '',
  physical: '',
  potential: '',
}

function validateForm(form) {
  const errors = {}
  const nameError = validatePlayerName(form.name)
  if (nameError) errors.name = nameError
  const positionError = validateRequired(form.position, 'a posição')
  if (positionError) errors.position = positionError
  const agilityError = validateAgility(form.agility)
  if (agilityError) errors.agility = agilityError
  const ageError = validateAge(form.age)
  if (ageError) errors.age = ageError
  for (const field of ATTRIBUTE_FIELDS) {
    const error = validateAttribute(form[field.key])
    if (error) errors[field.key] = error
  }
  return errors
}

/**
 * Cadastro de jogador com os sete indicadores (F04). Posição como toggles
 * (roeirotela.md, 2.2 "Seletores Visuais"), painel lateral com valor
 * base/overall bloqueados (calculados pela API só depois de salvar) e uma
 * prévia dos atributos em barras de progresso reagindo ao que é digitado.
 */
export function PlayerCreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const { run, isPending, errorMessage, fieldErrors } =
    useAsyncAction(createPlayer)
  const [createdPlayer, setCreatedPlayer] = useState(null)

  function handleFieldChange(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateForm(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const payload = {
      name: form.name.trim(),
      position: form.position,
      agility: Number(form.agility),
      age: Number(form.age),
      ...Object.fromEntries(
        ATTRIBUTE_FIELDS.map((field) => [field.key, Number(form[field.key])]),
      ),
    }

    try {
      const created = await run(payload)
      setCreatedPlayer(created)
      onCreated()
    } catch {
      // o `message` da API já fica disponível em errorMessage, mostrado abaixo
    }
  }

  if (createdPlayer) {
    return (
      <Modal
        title="Jogador cadastrado"
        description={`${createdPlayer.name} foi cadastrado com sucesso.`}
        fields={[
          {
            label: 'Valor base',
            value: formatCurrency(createdPlayer.base_value),
          },
          { label: 'Overall', value: createdPlayer.overall },
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
      title="Novo jogador"
      onClose={onClose}
      error={errorMessage}
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
          <div>
            <FormField
              id="player-name"
              label="Nome"
              error={fieldErrors.name ?? errors.name}
            >
              <input
                id="player-name"
                className="input-field"
                value={form.name}
                onChange={(event) =>
                  handleFieldChange('name', event.target.value)
                }
              />
            </FormField>

            <FormField
              id="player-position"
              label="Posição"
              error={fieldErrors.position ?? errors.position}
            >
              <ToggleButtonGroup
                name="player-position"
                ariaLabel="Posição"
                options={POSITIONS}
                value={form.position}
                onChange={(value) => handleFieldChange('position', value)}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="player-age"
                label="Idade (16 a 45)"
                error={fieldErrors.age ?? errors.age}
              >
                <input
                  id="player-age"
                  type="number"
                  className="input-field"
                  value={form.age}
                  onChange={(event) =>
                    handleFieldChange('age', event.target.value)
                  }
                />
              </FormField>

              <FormField
                id="player-agility"
                label="Agilidade (1 a 100)"
                error={fieldErrors.agility ?? errors.agility}
              >
                <input
                  id="player-agility"
                  type="number"
                  className="input-field"
                  value={form.agility}
                  onChange={(event) =>
                    handleFieldChange('agility', event.target.value)
                  }
                />
              </FormField>
            </div>

            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
              Atributos técnicos
            </p>
            <div className="grid grid-cols-2 gap-4">
              {TECHNICAL_ATTRIBUTE_FIELDS.map((field) => (
                <FormField
                  key={field.key}
                  id={`player-${field.key}`}
                  label={`${field.label} (1 a 99)`}
                  error={fieldErrors[field.key] ?? errors[field.key]}
                >
                  <input
                    id={`player-${field.key}`}
                    type="number"
                    className="input-field"
                    value={form[field.key]}
                    onChange={(event) =>
                      handleFieldChange(field.key, event.target.value)
                    }
                  />
                </FormField>
              ))}
            </div>

            <div className="pt-3 mt-1 border-t border-border">
              <FormField
                id="player-potential"
                label="Potencial (teto de evolução, 1 a 99)"
                error={fieldErrors.potential ?? errors.potential}
              >
                <input
                  id="player-potential"
                  type="number"
                  className="input-field"
                  value={form.potential}
                  onChange={(event) =>
                    handleFieldChange('potential', event.target.value)
                  }
                />
              </FormField>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-bg-muted p-4 space-y-4 h-fit">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Calculado pela API
              </p>
              <div className="space-y-2">
                <LockedField label="Valor base" value="—" />
                <LockedField label="Overall" value="—" />
              </div>
              <p className="text-xs text-text-muted mt-1.5">
                Disponíveis após salvar o jogador.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Prévia dos atributos
              </p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-muted w-20 shrink-0 truncate">
                    Agilidade
                  </span>
                  <ProgressBar value={Number(form.agility) || 0} max={100} />
                </div>
                {TECHNICAL_ATTRIBUTE_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center gap-2">
                    <span className="text-xs text-text-muted w-20 shrink-0 truncate">
                      {field.label}
                    </span>
                    <ProgressBar
                      value={Number(form[field.key]) || 0}
                      max={99}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-border">
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                Potencial
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-muted w-20 shrink-0 truncate">
                  {POTENTIAL_FIELD.label}
                </span>
                <ProgressBar value={Number(form.potential) || 0} max={99} />
              </div>
            </div>
          </div>
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
