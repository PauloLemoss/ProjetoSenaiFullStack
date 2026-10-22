import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as ligaApi from '../liga/api'
import { ClubLineup } from './ClubLineup'

vi.mock('../liga/api', () => ({
  getLineup: vi.fn(),
  saveLineup: vi.fn(),
}))

const PLAYERS = [
  { id: 1, name: 'Goleiro A', position: 'GOL', condition: 'APTO', overall: 70 },
  {
    id: 2,
    name: 'Zagueiro A',
    position: 'ZAG',
    condition: 'APTO',
    overall: 70,
  },
  {
    id: 3,
    name: 'Zagueiro B',
    position: 'ZAG',
    condition: 'DOENTE',
    overall: 70,
  },
  { id: 4, name: 'Lateral A', position: 'LAT', condition: 'APTO', overall: 70 },
  { id: 5, name: 'Meia A', position: 'MEI', condition: 'APTO', overall: 70 },
  {
    id: 6,
    name: 'Atacante A',
    position: 'ATA',
    condition: 'APTO',
    overall: 70,
  },
  {
    id: 7,
    name: 'Atacante B',
    position: 'ATA',
    condition: 'MAL_CONDICIONADO',
    overall: 70,
  },
]

function renderLineup({
  clubId = 1,
  players = PLAYERS,
  lineup = { formation: null, complete: false, players: [] },
  lineupState = 'ready',
  reload = vi.fn(),
} = {}) {
  return render(
    <ClubLineup
      clubId={clubId}
      players={players}
      lineup={lineup}
      lineupState={lineupState}
      reload={reload}
    />,
  )
}

async function chooseFormation(user, value) {
  await user.click(screen.getByRole('radio', { name: value }))
}

describe('ClubLineup', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renderiza o seletor de formação mesmo sem escalação existente', () => {
    renderLineup({ lineup: { formation: null, complete: false, players: [] } })
    expect(
      screen.getByRole('radiogroup', { name: 'Formação' }),
    ).toBeInTheDocument()
    expect(screen.queryByLabelText('Goleiro')).not.toBeInTheDocument()
  })

  it('renderiza o seletor de formação e as vagas depois de escolher uma formação', async () => {
    const user = userEvent.setup()
    renderLineup({ lineup: { formation: null, complete: false, players: [] } })

    await chooseFormation(user, '2-1-1')

    await waitFor(() =>
      expect(screen.getByLabelText('Goleiro')).toBeInTheDocument(),
    )
    expect(
      screen.getAllByLabelText('Defesa (Zagueiro ou Lateral)'),
    ).toHaveLength(2)
    expect(screen.getByLabelText('Meio-campo')).toBeInTheDocument()
    expect(screen.getByLabelText('Atacante')).toBeInTheDocument()
  })

  it('recalcula as vagas ao trocar de formação', async () => {
    const user = userEvent.setup()
    renderLineup({ lineup: { formation: null, complete: false, players: [] } })

    await chooseFormation(user, '3-1')
    await waitFor(() =>
      expect(
        screen.getAllByLabelText('Defesa (Zagueiro ou Lateral)'),
      ).toHaveLength(3),
    )
    expect(screen.queryByLabelText('Meio-campo')).not.toBeInTheDocument()

    await chooseFormation(user, '1-2-1')
    await waitFor(() =>
      expect(
        screen.getAllByLabelText('Defesa (Zagueiro ou Lateral)'),
      ).toHaveLength(1),
    )
    await waitFor(() =>
      expect(screen.getAllByLabelText('Meio-campo')).toHaveLength(2),
    )
  })

  it('não oferece jogador DOENTE como opção em qualquer vaga', async () => {
    const user = userEvent.setup()
    renderLineup({ lineup: { formation: null, complete: false, players: [] } })

    await chooseFormation(user, '2-1-1')
    await waitFor(() =>
      expect(screen.getByLabelText('Goleiro')).toBeInTheDocument(),
    )

    const defenseLabels = screen.getAllByLabelText(
      'Defesa (Zagueiro ou Lateral)',
    )
    const defenseSelect =
      defenseLabels[0].parentElement?.querySelector('select')

    // Zagueiro B (id 3) é DOENTE, não deve aparecer
    expect(
      defenseSelect?.querySelector('option[value="3"]'),
    ).not.toBeInTheDocument()
    // Zagueiro A (id 2) é APTO, deve aparecer
    expect(
      defenseSelect?.querySelector('option[value="2"]'),
    ).toBeInTheDocument()
  })

  it('permite escalar jogador MAL_CONDICIONADO e mostra o aviso', async () => {
    const user = userEvent.setup()
    renderLineup({ lineup: { formation: null, complete: false, players: [] } })

    await chooseFormation(user, '2-1-1')
    await waitFor(() =>
      expect(screen.getByLabelText('Atacante')).toBeInTheDocument(),
    )

    const attackSelect = screen.getByRole('combobox', {
      name: 'Atacante',
    })

    // Atacante B (id 7) é MAL_CONDICIONADO, deve aparecer como opção
    expect(attackSelect.querySelector('option[value="7"]')).toBeInTheDocument()

    await user.selectOptions(attackSelect, '7')

    expect(
      screen.getByText('Há jogador(es) mal condicionado(s) escalado(s).'),
    ).toBeInTheDocument()
  })

  it('mostra condição, overall e atributo usado do titular escalado', async () => {
    const user = userEvent.setup()
    renderLineup({ lineup: { formation: null, complete: false, players: [] } })

    await chooseFormation(user, '2-1-1')
    await waitFor(() =>
      expect(screen.getByLabelText('Goleiro')).toBeInTheDocument(),
    )

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Goleiro' }),
      '1',
    )

    expect(screen.getByText('Overall 70')).toBeInTheDocument()
    expect(screen.getByText(/Atributo usado: Defesa/)).toBeInTheDocument()
  })

  it('desabilita o botão salvar quando nem todas as vagas estão preenchidas', async () => {
    const user = userEvent.setup()
    renderLineup({ lineup: { formation: null, complete: false, players: [] } })

    await chooseFormation(user, '2-1-1')
    await waitFor(() =>
      expect(screen.getByLabelText('Goleiro')).toBeInTheDocument(),
    )

    // preenche só o goleiro
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Goleiro',
      }),
      '1',
    )
    const saveBtn = screen.getByRole('button', { name: /Salvar escalação/ })
    expect(saveBtn).toBeDisabled()
  })

  it('habilita o botão salvar com as 5 vagas preenchidas', async () => {
    const user = userEvent.setup()
    renderLineup({ lineup: { formation: null, complete: false, players: [] } })

    await chooseFormation(user, '2-1-1')
    await waitFor(() =>
      expect(screen.getByLabelText('Goleiro')).toBeInTheDocument(),
    )

    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Goleiro',
      }),
      '1',
    )
    await user.selectOptions(
      screen.getAllByRole('combobox', {
        name: 'Defesa (Zagueiro ou Lateral)',
      })[0],
      '2',
    )
    await user.selectOptions(
      screen.getAllByRole('combobox', {
        name: 'Defesa (Zagueiro ou Lateral)',
      })[1],
      '4',
    )
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Meio-campo',
      }),
      '5',
    )
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Atacante',
      }),
      '6',
    )

    const saveBtn = screen.getByRole('button', { name: /Salvar escalação/ })
    expect(saveBtn).not.toBeDisabled()
  })

  it('chama saveLineup com formation e player_ids ao salvar', async () => {
    const user = userEvent.setup()
    ligaApi.saveLineup.mockResolvedValue({
      club_id: 1,
      formation: '2-1-1',
      complete: true,
      players: [],
    })

    renderLineup({ lineup: { formation: null, complete: false, players: [] } })

    await chooseFormation(user, '2-1-1')
    await waitFor(() =>
      expect(screen.getByLabelText('Goleiro')).toBeInTheDocument(),
    )

    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Goleiro',
      }),
      '1',
    )
    await user.selectOptions(
      screen.getAllByRole('combobox', {
        name: 'Defesa (Zagueiro ou Lateral)',
      })[0],
      '2',
    )
    await user.selectOptions(
      screen.getAllByRole('combobox', {
        name: 'Defesa (Zagueiro ou Lateral)',
      })[1],
      '4',
    )
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Meio-campo',
      }),
      '5',
    )
    await user.selectOptions(
      screen.getByRole('combobox', {
        name: 'Atacante',
      }),
      '6',
    )

    await user.click(screen.getByRole('button', { name: /Salvar escalação/ }))

    expect(ligaApi.saveLineup).toHaveBeenCalledWith(1, {
      formation: '2-1-1',
      player_ids: [1, 2, 4, 5, 6],
    })
  })

  it('pré-preenche o formulário quando já existe escalação salva', async () => {
    renderLineup({
      lineup: {
        formation: '2-1-1',
        complete: true,
        players: [
          { id: 1, name: 'Goleiro A', position: 'GOL' },
          { id: 2, name: 'Zagueiro A', position: 'ZAG' },
          { id: 4, name: 'Lateral A', position: 'LAT' },
          { id: 5, name: 'Meia A', position: 'MEI' },
          { id: 6, name: 'Atacante A', position: 'ATA' },
        ],
      },
    })

    await waitFor(() =>
      expect(screen.getByRole('radio', { name: '2-1-1' })).toBeChecked(),
    )
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Goleiro' })).toHaveValue(
        '1',
      ),
    )
    expect(
      screen.getAllByRole('combobox', {
        name: 'Defesa (Zagueiro ou Lateral)',
      })[0],
    ).toHaveValue('2')
    expect(
      screen.getAllByRole('combobox', {
        name: 'Defesa (Zagueiro ou Lateral)',
      })[1],
    ).toHaveValue('4')
    expect(screen.getByRole('combobox', { name: 'Meio-campo' })).toHaveValue(
      '5',
    )
    expect(screen.getByRole('combobox', { name: 'Atacante' })).toHaveValue('6')
    // botão deve estar habilitado com as 5 vagas preenchidas
    expect(
      screen.getByRole('button', { name: /Salvar escalação/ }),
    ).not.toBeDisabled()
  })

  it('não oferece jogador DOENTE como opção nem pré-preenche com ele', async () => {
    renderLineup({
      lineup: {
        formation: '2-1-1',
        complete: true,
        players: [
          { id: 1, name: 'Goleiro A', position: 'GOL' },
          { id: 3, name: 'Zagueiro B', position: 'ZAG', condition: 'DOENTE' },
          { id: 4, name: 'Lateral A', position: 'LAT' },
          { id: 5, name: 'Meia A', position: 'MEI' },
          { id: 6, name: 'Atacante A', position: 'ATA' },
        ],
      },
    })

    await waitFor(() =>
      expect(screen.getByRole('radio', { name: '2-1-1' })).toBeChecked(),
    )
    // Zagueiro B (id 3) é DOENTE: não deve aparecer como opção no select de defesa
    const defenseSelects = screen.getAllByRole('combobox', {
      name: 'Defesa (Zagueiro ou Lateral)',
    })
    const firstDefenseOptions = defenseSelects[0].querySelectorAll('option')
    const firstDefenseValues = Array.from(firstDefenseOptions).map(
      (o) => o.value,
    )
    expect(firstDefenseValues).not.toContain('3')
  })
})
