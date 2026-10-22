import { useMemo, useState } from 'react'
import { FormField } from '../../shared/FormField'
import { Avatar } from '../../shared/Avatar'
import { ConditionBadge } from '../../shared/ConditionBadge'
import { IconAlertTriangle, IconHeart } from '../../shared/Icon'
import { useAsyncAction } from '../../shared/useAsyncAction'
import { saveLineup } from '../liga/api'

const FORMATIONS = [
  { value: '3-1', label: '3-1', defense: 3, midfield: 0, attack: 1 },
  { value: '2-2', label: '2-2', defense: 2, midfield: 0, attack: 2 },
  { value: '2-1-1', label: '2-1-1', defense: 2, midfield: 1, attack: 1 },
  { value: '1-2-1', label: '1-2-1', defense: 1, midfield: 2, attack: 1 },
]

const SLOT_TYPES = {
  GOL: 'GOL',
  DEFENSE: 'DEFENSE',
  MIDFIELD: 'MIDFIELD',
  ATTACK: 'ATTACK',
}

const POSITION_LABELS = {
  GOL: 'Goleiro',
  DEFENSE: 'Defesa (Zagueiro ou Lateral)',
  MIDFIELD: 'Meio-campo',
  ATTACK: 'Atacante',
}

/**
 * Atributo usado no ataque por posição do jogador (backend/liga/calculos.py,
 * `_ATRIBUTO_DE_ATAQUE`). O goleiro nunca ataca num duelo — joga só na
 * defesa, por isso aparece com o atributo "Defesa".
 */
const ATTACK_ATTRIBUTE_LABEL_BY_POSITION = {
  GOL: 'Defesa',
  ZAG: 'Drible',
  LAT: 'Drible',
  MEI: 'Passe',
  ATA: 'Finalização',
}

const PITCH_ROW_TOP_BY_TYPE = {
  ATTACK: '14%',
  MIDFIELD: '40%',
  DEFENSE: '66%',
  GOL: '88%',
}

/**
 * Filtros de elegibilidade por tipo de vaga da escalação.
 * Jogador DOENTE nunca é oferecido como opção em nenhuma vaga.
 */
function isEligible(player, slotType) {
  if (player.condition === 'DOENTE') return false
  switch (slotType) {
    case SLOT_TYPES.GOL:
      return player.position === 'GOL'
    case SLOT_TYPES.DEFENSE:
      return player.position === 'ZAG' || player.position === 'LAT'
    case SLOT_TYPES.MIDFIELD:
      return player.position === 'MEI'
    case SLOT_TYPES.ATTACK:
      return player.position === 'ATA'
    default:
      return false
  }
}

/**
 * Monta a lista de vagas (slots) da formação: sempre 1 goleiro, depois as
 * vagas de linha (defesa, meio, ataque) conforme a formação escolhida.
 */
function buildSlots(formation) {
  const f = FORMATIONS.find((fo) => fo.value === formation)
  if (!f) return []
  const slots = [{ type: SLOT_TYPES.GOL }]
  for (let _i = 0; _i < f.defense; _i++)
    slots.push({ type: SLOT_TYPES.DEFENSE })
  for (let _i = 0; _i < f.midfield; _i++)
    slots.push({ type: SLOT_TYPES.MIDFIELD })
  for (let _i = 0; _i < f.attack; _i++) slots.push({ type: SLOT_TYPES.ATTACK })
  return slots
}

/**
 * Extrai os ids dos titulares da escalação devolvida pela API, ordenados
 * conforme as vagas da formação (1 GOL, depois defesa/meio/ataque).
 */
function playerIdsBySlots(lineup) {
  if (!lineup || !lineup.players || !lineup.formation) return []
  const slotsByType = buildSlots(lineup.formation)
  const playersByPos = {}
  for (const p of lineup.players) {
    playersByPos[p.position] = playersByPos[p.position] || []
    playersByPos[p.position].push(p.id)
  }
  const ids = []
  for (const slot of slotsByType) {
    if (slot.type === SLOT_TYPES.GOL) {
      ids.push(playersByPos['GOL']?.[0] ?? null)
    } else if (slot.type === SLOT_TYPES.DEFENSE) {
      const def = (playersByPos['ZAG'] ?? []).concat(playersByPos['LAT'] ?? [])
      ids.push(def.find((id) => !ids.includes(id)) ?? null)
    } else if (slot.type === SLOT_TYPES.MIDFIELD) {
      ids.push(
        (playersByPos['MEI'] ?? []).find((id) => !ids.includes(id)) ?? null,
      )
    } else if (slot.type === SLOT_TYPES.ATTACK) {
      ids.push(
        (playersByPos['ATA'] ?? []).find((id) => !ids.includes(id)) ?? null,
      )
    }
  }
  return ids
}

/** Mini desenho tático: linhas de pontos (goleiro + defesa/meio/ataque). */
function FormationDiagram({ defense, midfield, attack }) {
  const rows = [
    { count: 1 },
    { count: defense },
    ...(midfield > 0 ? [{ count: midfield }] : []),
    { count: attack },
  ]
  return (
    <div className="flex flex-col-reverse items-center gap-1.5 w-14 h-14 justify-center rounded-md bg-bg-muted">
      {rows.map((row, index) => (
        <div key={index} className="flex gap-1">
          {Array.from({ length: row.count }).map((_, dotIndex) => (
            <span
              key={dotIndex}
              className="w-1.5 h-1.5 rounded-full bg-primary/70"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Seletor visual de formação: cards clicáveis com um desenho tático pequeno
 * (roeirotela.md, 3.4 "Formação | Radio Cards (Toggles) com desenhos
 * táticos").
 */
function FormationPicker({ value, onChange }) {
  return (
    <div
      role="radiogroup"
      aria-label="Formação"
      className="flex flex-wrap gap-3"
    >
      {FORMATIONS.map((formation) => {
        const selected = formation.value === value
        return (
          <button
            key={formation.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(formation.value)}
            className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
              selected
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-bg-muted'
            }`}
          >
            <FormationDiagram
              defense={formation.defense}
              midfield={formation.midfield}
              attack={formation.attack}
            />
            <span className="text-sm font-semibold text-text">
              {formation.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Campo visual: desenho do campo com os titulares plotados conforme a
 * formação (roeirotela.md, 3.4 "Campo Visual"). Jogador mal condicionado
 * ganha um marcador de coração laranja sobre o avatar.
 */
function PitchPreview({ slots, playerIds, playersById }) {
  const slotsByType = {}
  slots.forEach((slot, index) => {
    slotsByType[slot.type] = slotsByType[slot.type] ?? []
    slotsByType[slot.type].push(index)
  })

  return (
    <div className="relative w-full aspect-[4/3] rounded-lg bg-emerald-800 border border-emerald-900 overflow-hidden">
      <div className="absolute inset-3 border border-white/25 rounded pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 w-16 h-16 -translate-x-1/2 -translate-y-1/2 border border-white/25 rounded-full pointer-events-none" />

      {Object.entries(slotsByType).map(([type, indexes]) =>
        indexes.map((slotIndex, orderInRow) => {
          const playerId = playerIds[slotIndex]
          const player = playerId ? playersById[playerId] : null
          const leftPercent = ((orderInRow + 1) / (indexes.length + 1)) * 100

          return (
            <div
              key={slotIndex}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{
                top: PITCH_ROW_TOP_BY_TYPE[type],
                left: `${leftPercent}%`,
              }}
            >
              <div className="relative">
                {player ? (
                  <Avatar label={player.name} seed={player.id} size="sm" />
                ) : (
                  <span className="flex items-center justify-center w-7 h-7 rounded-full border-2 border-dashed border-white/50 text-white/70 text-xs">
                    ?
                  </span>
                )}
                {player?.condition === 'MAL_CONDICIONADO' && (
                  <span
                    title="Mal condicionado"
                    className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 rounded-full bg-surface text-warning"
                  >
                    <IconHeart className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            </div>
          )
        }),
      )}
    </div>
  )
}

/**
 * Escalação de titulares (F12): escolhe formação (cards com desenho tático)
 * e um titular para cada vaga (1 goleiro + jogadores de linha), sem DOENTE.
 * Mostra condição/overall/atributo usado de cada titular escalado, um aviso
 * se algum estiver mal condicionado, e o campo visual com a plotagem dos
 * titulares (roeirotela.md, 3.4). O botão salvar só habilita com as 5 vagas
 * preenchidas. Depois de salvar, mostra a escalação da API e recarrega sem
 * reload de página.
 *
 * Recebe lineup, state e reload do pai (ClubPage), que detém a única chamada
 * ao GET /clubs/{id}/lineup.
 */
export function ClubLineup({ clubId, players, lineup, reload }) {
  const initialFormation = lineup?.formation ?? ''
  const initialPlayerIds =
    lineup && lineup.formation ? playerIdsBySlots(lineup) : []
  const [formation, setFormation] = useState(initialFormation)
  const [playerIds, setPlayerIds] = useState(initialPlayerIds)
  const { run, isPending, errorMessage } = useAsyncAction((payload) =>
    saveLineup(clubId, payload),
  )

  const slots = useMemo(() => buildSlots(formation), [formation])
  const playersById = useMemo(
    () => Object.fromEntries(players.map((p) => [p.id, p])),
    [players],
  )

  const allFilled =
    playerIds.length === slots.length && playerIds.every(Boolean)
  const hasMalCondicionado = playerIds.some(
    (id) => id && playersById[id]?.condition === 'MAL_CONDICIONADO',
  )

  function handleFormationChange(nextFormation) {
    setFormation(nextFormation)
    const nextSlots = buildSlots(nextFormation)
    setPlayerIds(Array(nextSlots.length).fill(null))
  }

  function handlePlayerChange(slotIndex, playerId) {
    const next = [...playerIds]
    next[slotIndex] = playerId
    setPlayerIds(next)
  }

  async function handleSave(event) {
    event.preventDefault()
    const payload = {
      formation,
      player_ids: playerIds.filter(Boolean).map(Number),
    }
    try {
      await run(payload)
      reload()
    } catch {
      // o message da API fica disponível em errorMessage
    }
  }

  const eligibleBySlot = slots.map((slot) =>
    players.filter((p) => isEligible(p, slot.type)),
  )

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-text">
        Escalação de titulares
      </h2>

      <FormField id="lineup-formation" label="Formação">
        <FormationPicker value={formation} onChange={handleFormationChange} />
      </FormField>

      {!formation ? null : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <form onSubmit={handleSave} noValidate className="space-y-1">
            {slots.map((slot, _slotIndex) => {
              const eligible = eligibleBySlot[_slotIndex]
              const selectedId = playerIds[_slotIndex] ?? null
              const selectedPlayer = selectedId ? playersById[selectedId] : null
              return (
                <FormField
                  key={`slot-${slot.type}-${_slotIndex}`}
                  id={`lineup-slot-${slot.type}-${_slotIndex}`}
                  label={POSITION_LABELS[slot.type]}
                >
                  <select
                    id={`lineup-slot-${slot.type}-${_slotIndex}`}
                    value={selectedId ?? ''}
                    className="input-field"
                    onChange={(event) =>
                      handlePlayerChange(_slotIndex, event.target.value || null)
                    }
                  >
                    <option value="">Escolha um titular</option>
                    {eligible.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                  </select>
                  {selectedPlayer && (
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <ConditionBadge condition={selectedPlayer.condition} />
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-bg-muted text-xs font-medium text-text">
                        Overall {selectedPlayer.overall}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-bg-muted text-xs font-medium text-text">
                        Atributo usado:{' '}
                        {ATTACK_ATTRIBUTE_LABEL_BY_POSITION[
                          selectedPlayer.position
                        ] ?? '—'}
                      </span>
                    </div>
                  )}
                </FormField>
              )
            })}

            {hasMalCondicionado && (
              <p className="flex items-center gap-2 px-3 py-2 rounded-md border border-warning bg-warning-bg text-warning text-sm font-medium">
                <IconAlertTriangle className="w-4 h-4 shrink-0" />
                Há jogador(es) mal condicionado(s) escalado(s).
              </p>
            )}

            {errorMessage && (
              <p role="alert" className="form-field-error mt-2">
                {errorMessage}
              </p>
            )}

            <div className="mt-4 flex flex-row-reverse gap-2">
              <button
                type="submit"
                disabled={isPending || !allFilled}
                className="btn-primary"
              >
                {isPending ? 'Salvando…' : 'Salvar escalação'}
              </button>
              <button
                type="button"
                onClick={() => handleFormationChange('')}
                disabled={isPending}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </form>

          <PitchPreview
            slots={slots}
            playerIds={playerIds}
            playersById={playersById}
          />
        </div>
      )}
    </section>
  )
}
