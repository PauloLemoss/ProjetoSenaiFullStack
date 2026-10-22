import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import * as clubesApi from './api'
import { ClubesPage } from './ClubesPage'

vi.mock('./api', () => ({
  listClubs: vi.fn().mockResolvedValue([]),
  createClub: vi.fn(),
  updateClub: vi.fn(),
}))

const CLUB = {
  id: 1,
  name: 'Clube Teste',
  acronym: 'TST',
  cash: 100000,
  squad_value: 250000,
  net_worth: 350000,
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ClubesPage />
    </MemoryRouter>,
  )
}

describe('ClubesPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('mostra a tabela de clubes na ordem devolvida pela API', async () => {
    clubesApi.listClubs.mockResolvedValue([CLUB])

    renderPage()

    await waitFor(() =>
      expect(screen.getByText('Clube Teste')).toBeInTheDocument(),
    )
    // "TST" aparece duas vezes: no escudo (avatar) e na coluna Sigla
    expect(screen.getAllByText('TST').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('100.000,00')).toBeInTheDocument()
    expect(screen.getByText('250.000,00')).toBeInTheDocument()
    // patrimônio não aparece na lista, só nos cartões da página do clube
    expect(screen.queryByText('350.000,00')).not.toBeInTheDocument()
    // contador "X de 20 clubes criados"
    expect(screen.getByText('1 de 20 clubes criados')).toBeInTheDocument()
    // ordenação padrão é por nome, sem reordenação no cliente
    expect(clubesApi.listClubs).toHaveBeenCalledWith('name')
  })

  it('ordena por patrimônio do maior para o menor ao escolher a opção', async () => {
    const user = userEvent.setup()
    clubesApi.listClubs.mockResolvedValue([])

    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Nenhum clube cadastrado.')).toBeInTheDocument(),
    )

    await user.selectOptions(
      screen.getByLabelText('Ordenar por'),
      'Patrimônio (maior para menor)',
    )

    expect(clubesApi.listClubs).toHaveBeenLastCalledWith('net_worth_desc')
  })

  it('cadastra um clube e ele aparece na listagem sem recarregar a página', async () => {
    const user = userEvent.setup()
    clubesApi.listClubs
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ ...CLUB, id: 2, name: 'Novo Clube' }])
    clubesApi.createClub.mockResolvedValue({
      ...CLUB,
      id: 2,
      name: 'Novo Clube',
    })

    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Nenhum clube cadastrado.')).toBeInTheDocument(),
    )

    await user.click(screen.getByRole('button', { name: 'Novo clube' }))
    const dialog = within(screen.getByRole('dialog'))
    await user.type(dialog.getByLabelText('Nome'), 'Novo Clube')
    await user.type(dialog.getByLabelText('Sigla'), 'NVC')

    await user.click(dialog.getByRole('button', { name: 'Salvar' }))

    expect(
      await screen.findByText('Clube cadastrado com sucesso.'),
    ).toBeInTheDocument()
    // o clube aparece na listagem (linha da tabela) e também no modal de confirmação
    expect(await screen.findAllByText('Novo Clube')).toHaveLength(2)
    expect(clubesApi.createClub).toHaveBeenCalledWith({
      name: 'Novo Clube',
      acronym: 'NVC',
    })
  })

  it('mostra o message da API quando nome ou sigla já existem (409), sem bloquear o envio', async () => {
    const user = userEvent.setup()
    clubesApi.listClubs.mockResolvedValue([])
    clubesApi.createClub.mockRejectedValue({
      message: 'Já existe um clube com este nome ou sigla.',
      status: 409,
    })

    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Nenhum clube cadastrado.')).toBeInTheDocument(),
    )

    await user.click(screen.getByRole('button', { name: 'Novo clube' }))
    const dialog = within(screen.getByRole('dialog'))
    await user.type(dialog.getByLabelText('Nome'), 'Clube Existente')
    await user.type(dialog.getByLabelText('Sigla'), 'EXT')

    await user.click(dialog.getByRole('button', { name: 'Salvar' }))

    expect(
      screen.getByText('Já existe um clube com este nome ou sigla.'),
    ).toBeInTheDocument()
    expect(clubesApi.createClub).toHaveBeenCalled()
  })

  it('não chama a API de cadastro quando o formulário está inválido', async () => {
    const user = userEvent.setup()
    clubesApi.listClubs.mockResolvedValue([])

    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Nenhum clube cadastrado.')).toBeInTheDocument(),
    )

    await user.click(screen.getByRole('button', { name: 'Novo clube' }))
    const dialog = within(screen.getByRole('dialog'))
    await user.click(dialog.getByRole('button', { name: 'Salvar' }))

    expect(screen.getByText('Informe o nome.')).toBeInTheDocument()
    expect(screen.getByText('Informe a sigla.')).toBeInTheDocument()
    expect(clubesApi.createClub).not.toHaveBeenCalled()
  })

  it('abre o editor preenchido com os dados do clube e atualiza a lista ao salvar', async () => {
    const user = userEvent.setup()
    clubesApi.listClubs.mockResolvedValue([CLUB])
    clubesApi.updateClub.mockResolvedValue({
      ...CLUB,
      name: 'Clube Atualizado',
      acronym: 'ATZ',
    })

    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Clube Teste')).toBeInTheDocument(),
    )

    // clica no ícone de Editar da linha do clube
    await user.click(screen.getByRole('button', { name: 'Editar' }))
    const editDialog = within(screen.getByRole('dialog'))
    expect(editDialog.getByLabelText('Nome')).toHaveValue('Clube Teste')
    expect(editDialog.getByLabelText('Sigla')).toHaveValue('TST')

    await user.clear(editDialog.getByLabelText('Nome'))
    await user.type(editDialog.getByLabelText('Nome'), 'Clube Atualizado')
    await user.click(editDialog.getByRole('button', { name: 'Salvar' }))

    expect(
      await screen.findByText('Clube atualizado com sucesso.'),
    ).toBeInTheDocument()
    expect(clubesApi.updateClub).toHaveBeenCalledWith(1, {
      name: 'Clube Atualizado',
      acronym: 'TST',
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('mostra message da API quando nome já existe ao editar', async () => {
    const user = userEvent.setup()
    clubesApi.listClubs.mockResolvedValue([CLUB])
    clubesApi.updateClub.mockRejectedValue({
      message: 'Já existe um clube com este nome ou sigla.',
      status: 409,
    })

    renderPage()
    await waitFor(() =>
      expect(screen.getByText('Clube Teste')).toBeInTheDocument(),
    )

    await user.click(screen.getByRole('button', { name: 'Editar' }))
    const dialog = within(screen.getByRole('dialog'))
    await user.clear(dialog.getByLabelText('Nome'))
    await user.type(dialog.getByLabelText('Nome'), 'Outro Nome')
    await user.click(dialog.getByRole('button', { name: 'Salvar' }))

    expect(
      screen.getByText('Já existe um clube com este nome ou sigla.'),
    ).toBeInTheDocument()
    expect(dialog.getByLabelText('Nome')).toHaveValue('Outro Nome')
  })
})
