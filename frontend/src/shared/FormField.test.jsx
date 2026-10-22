import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FormField } from './FormField'

describe('FormField', () => {
  it('associa o rótulo ao campo e mostra a mensagem de erro junto dele', () => {
    render(
      <FormField
        id="player-name"
        label="Nome"
        error="Informe de 3 a 100 caracteres"
      >
        <input id="player-name" />
      </FormField>,
    )

    expect(screen.getByLabelText('Nome')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Informe de 3 a 100 caracteres',
    )
  })

  it('não mostra erro quando não há', () => {
    render(
      <FormField id="player-age" label="Idade">
        <input id="player-age" />
      </FormField>,
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
