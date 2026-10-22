import { afterEach, describe, expect, it, vi } from 'vitest'
import { listPlayers } from './api'

describe('features/jogadores api', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('listPlayers chama GET /players com os filtros como query params', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [], meta: { total_items: 0 } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await listPlayers({ search: 'joao', free: true })

    const [calledUrl, options] = fetchMock.mock.calls[0]
    expect(options.method).toBe('GET')
    expect(calledUrl.toString()).toBe(
      'http://localhost:8000/api/v1/players?search=joao&free=true',
    )
  })
})
