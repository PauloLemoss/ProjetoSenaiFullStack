import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Modal } from './Modal'

describe('Modal', () => {
  it('mostra o título, a descrição e a lista de campo/valor', () => {
    render(
      <Modal
        title="Compra concluída"
        description="Eduardo Paiva agora é do Tubarões EC."
        fields={[
          { label: 'Valor', value: '46,00' },
          { label: 'Taxa', value: '2,30' },
        ]}
      />,
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Compra concluída')).toBeInTheDocument()
    expect(
      screen.getByText('Eduardo Paiva agora é do Tubarões EC.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Valor')).toBeInTheDocument()
    expect(screen.getByText('46,00')).toBeInTheDocument()
  })
})
