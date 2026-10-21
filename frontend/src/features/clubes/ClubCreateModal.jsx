import { useState } from 'react'
import { Modal } from '../../shared/Modal'
import { FormField } from '../../shared/FormField'
import { useAsyncAction } from '../../shared/useAsyncAction'
import { createClub } from './api'
import { validateClubAcronym, validateClubName } from './validation'

const EMPTY_FORM = {
  name: '',
  acronym: '',
}

function validateForm(form) {
  const errors = {}
  const nameError = validateClubName(form.name)
  if (nameError) errors.name = nameError
  const acronymError = validateClubAcronym(form.acronym)
  if (acronymError) errors.acronym = acronymError
  return errors
}

/**
 * Cadastro de clube com nome e sigla (F05). Nome ou sigla repetidos não são
 * bloqueados na tela: o envio é feito normalmente e o `message` da API
 * (ex.: 409) é mostrado quando ela recusar.
 */
export function ClubCreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const { run, isPending, errorMessage, fieldErrors } =
    useAsyncAction(createClub)
  const [createdClub, setCreatedClub] = useState(null)

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
      acronym: form.acronym.trim().toUpperCase(),
    }

    try {
      const created = await run(payload)
      setCreatedClub(created)
      onCreated()
    } catch {
      // o `message` da API fica disponível em errorMessage, mostrado abaixo
    }
  }

  if (createdClub) {
    return (
      <Modal
        title="Clube criado"
        description={`${createdClub.name} foi cadastrado com sucesso.`}
        fields={[
          { label: 'Nome', value: createdClub.name },
          { label: 'Sigla', value: createdClub.acronym },
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
    <Modal title="Novo clube" onClose={onClose} error={errorMessage}>
      <form onSubmit={handleSubmit} noValidate>
        <FormField
          id="club-name"
          label="Nome"
          error={fieldErrors.name ?? errors.name}
        >
          <input
            id="club-name"
            className="input-field"
            value={form.name}
            onChange={(event) => handleFieldChange('name', event.target.value)}
          />
        </FormField>

        <FormField
          id="club-acronym"
          label="Sigla"
          error={fieldErrors.acronym ?? errors.acronym}
        >
          <input
            id="club-acronym"
            className="input-field"
            value={form.acronym}
            onChange={(event) =>
              handleFieldChange('acronym', event.target.value.toUpperCase())
            }
          />
        </FormField>

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
