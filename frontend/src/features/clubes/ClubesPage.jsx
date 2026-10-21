import { useState } from 'react'
import { ClubCreateModal } from './ClubCreateModal'
import { ClubEditModal } from './ClubEditModal'
import { ClubesTable } from './ClubesTable'
import { MAX_CLUBS, SORT_OPTIONS } from './constants'
import { useClubsList } from './useClubsList'
import { FormField } from '../../shared/FormField'
import { PageHeader } from '../../shared/PageHeader'
import { IconPlus, IconShield } from '../../shared/Icon'

const DEFAULT_SORT = 'name'

export function ClubesPage() {
  const [sort, setSort] = useState(DEFAULT_SORT)
  const [modal, setModal] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  const { clubs, state, errorMessage, reload } = useClubsList(sort)

  function closeModal() {
    setModal(null)
  }

  function announceSuccess(message) {
    setSuccessMessage(message)
    reload()
  }

  return (
    <section className="space-y-4">
      <PageHeader
        icon={<IconShield className="w-6 h-6" />}
        title="Clubes"
        description="Cadastre clubes e acompanhe o caixa, o valor do elenco e o patrimônio de cada um."
        action={
          <button
            type="button"
            onClick={() => setModal({ type: 'create' })}
            className="btn-primary gap-1.5"
          >
            <IconPlus className="w-4 h-4" />
            Novo clube
          </button>
        }
      />

      {successMessage && (
        <p
          role="status"
          className="px-3 py-2 rounded-md text-sm font-medium bg-success-bg text-success"
        >
          {successMessage}
          <button
            type="button"
            onClick={() => setSuccessMessage('')}
            aria-label="Fechar mensagem"
            className="ml-2 rounded text-success hover:bg-success/20"
          >
            ×
          </button>
        </p>
      )}

      {errorMessage && (
        <p
          role="alert"
          className="px-3 py-2 rounded-md text-sm font-medium bg-danger-bg text-danger"
        >
          {errorMessage}
        </p>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-muted text-sm font-medium text-text-muted w-fit">
          {clubs.length} de {MAX_CLUBS} clubes criados
        </span>

        <FormField id="club-sort" label="Ordenar por">
          <select
            id="club-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="input-field"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <ClubesTable
        clubs={clubs}
        state={state}
        errorMessage={errorMessage}
        onRetry={reload}
        onEdit={(club) => setModal({ type: 'edit', club })}
      />

      {modal?.type === 'create' && (
        <ClubCreateModal
          onClose={closeModal}
          onCreated={() => announceSuccess('Clube cadastrado com sucesso.')}
        />
      )}
      {modal?.type === 'edit' && (
        <ClubEditModal
          club={modal.club}
          onClose={closeModal}
          onUpdated={() => announceSuccess('Clube atualizado com sucesso.')}
        />
      )}
    </section>
  )
}
