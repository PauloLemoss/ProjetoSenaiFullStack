import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, httpClient } from './httpClient'

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

describe('httpClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('GET monta a URL com a base da API e devolve o JSON da resposta', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(jsonResponse({ data: [], meta: { total_items: 0 } }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await httpClient.get('/players', { search: 'joao' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [calledUrl] = fetchMock.mock.calls[0]
    expect(calledUrl.toString()).toBe(
      'http://localhost:8000/api/v1/players?search=joao',
    )
    expect(result).toEqual({ data: [], meta: { total_items: 0 } })
  })

  it('recusa com ApiError trazendo o message devolvido pela API', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          jsonResponse({ message: 'Nome já cadastrado' }, 409),
        ),
    )

    await expect(
      httpClient.post('/clubs', { name: 'Águias FC', acronym: 'AGU' }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 409,
      message: 'Nome já cadastrado',
    })
  })

  it('recusa com errors do corpo da API no ApiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(
          {
            message: 'Idade deve ser um número inteiro de 16 a 45.',
            errors: [
              {
                field: 'age',
                message: 'Idade deve ser um número inteiro de 16 a 45.',
              },
            ],
          },
          400,
        ),
      ),
    )

    await expect(
      httpClient.post('/players', { age: 10 }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      message: 'Idade deve ser um número inteiro de 16 a 45.',
      errors: [
        {
          field: 'age',
          message: 'Idade deve ser um número inteiro de 16 a 45.',
        },
      ],
    })
  })

  it('DELETE com resposta 204 devolve null, sem tentar ler corpo', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    )

    await expect(httpClient.delete('/players/5')).resolves.toBeNull()
  })

  it('ApiError é uma instância de Error', () => {
    const error = new ApiError('falhou', 400)
    expect(error).toBeInstanceOf(Error)
    expect(error.status).toBe(400)
  })
})
