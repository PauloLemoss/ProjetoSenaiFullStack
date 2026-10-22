import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useQuery } from './useQuery'

describe('useQuery', () => {
  it('começa carregando e depois mostra o dado pronto', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: [1, 2, 3] })

    const { result } = renderHook(() => useQuery(fetchFn, []))

    expect(result.current.state).toBe('loading')
    await waitFor(() => expect(result.current.state).toBe('ready'))
    expect(result.current.data).toEqual({ data: [1, 2, 3] })
  })

  it('devolve o estado de erro com a mensagem da falha', async () => {
    const fetchFn = vi
      .fn()
      .mockRejectedValue(new Error('Não foi possível carregar'))

    const { result } = renderHook(() => useQuery(fetchFn, []))

    await waitFor(() => expect(result.current.state).toBe('error'))
    expect(result.current.errorMessage).toBe('Não foi possível carregar')
  })

  it('reload busca de novo', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: [] })
    const { result } = renderHook(() => useQuery(fetchFn, []))

    await waitFor(() => expect(result.current.state).toBe('ready'))
    expect(fetchFn).toHaveBeenCalledTimes(1)

    act(() => result.current.reload())

    await waitFor(() => expect(fetchFn).toHaveBeenCalledTimes(2))
  })
})
