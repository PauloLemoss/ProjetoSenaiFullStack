import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ApiError } from '../lib/httpClient'
import { useAsyncAction } from './useAsyncAction'

describe('useAsyncAction', () => {
  it('ignora uma segunda chamada enquanto a primeira está pendente (proteção a duplo clique)', async () => {
    let resolveAction
    const actionFn = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveAction = resolve
        }),
    )
    const { result } = renderHook(() => useAsyncAction(actionFn))

    act(() => {
      result.current.run()
      result.current.run()
    })

    expect(actionFn).toHaveBeenCalledTimes(1)
    await act(async () => resolveAction('ok'))
    await waitFor(() => expect(result.current.status).toBe('success'))
  })

  it('expõe fieldErrors com o mapeamento campo -> mensagem quando a ação falha com errors da API', async () => {
    const actionFn = vi.fn().mockRejectedValue(
      new ApiError('Idade deve ser um número inteiro de 16 a 45.', 400, [
        {
          field: 'age',
          message: 'Idade deve ser um número inteiro de 16 a 45.',
        },
      ]),
    )
    const { result } = renderHook(() => useAsyncAction(actionFn))

    await act(async () => {
      await expect(result.current.run()).rejects.toThrow(
        'Idade deve ser um número inteiro de 16 a 45.',
      )
    })

    expect(result.current.status).toBe('error')
    expect(result.current.errorMessage).toBe(
      'Idade deve ser um número inteiro de 16 a 45.',
    )
    expect(result.current.fieldErrors).toEqual({
      age: 'Idade deve ser um número inteiro de 16 a 45.',
    })
  })

  it('guarda o message do erro quando a ação falha', async () => {
    const actionFn = vi.fn().mockRejectedValue(new Error('Elenco cheio'))
    const { result } = renderHook(() => useAsyncAction(actionFn))

    await act(async () => {
      await expect(result.current.run()).rejects.toThrow('Elenco cheio')
    })

    expect(result.current.status).toBe('error')
    expect(result.current.errorMessage).toBe('Elenco cheio')
  })
})
