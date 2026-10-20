const baseUrl =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

function buildUrl(path, query) {
  const url = new URL(path.replace(/^\//, ''), `${baseUrl}/`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === '') continue
      url.searchParams.set(key, value)
    }
  }
  return url
}

async function parseErrorMessage(response) {
  try {
    const body = await response.json()
    if (body && typeof body.message === 'string' && body.message.length > 0) {
      return {
        message: body.message,
        errors: Array.isArray(body.errors) ? body.errors : [],
      }
    }
  } catch {
    // resposta sem corpo JSON (ex.: erro de rede já tratado antes de chegar aqui)
  }
  return {
    message: `Erro ${response.status} ao comunicar com a API`,
    errors: [],
  }
}

async function request(method, path, { query, body } = {}) {
  const url = buildUrl(path, query)
  const response = await fetch(url, {
    method,
    headers:
      body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const { message, errors } = await parseErrorMessage(response)
    throw new ApiError(message, response.status, errors)
  }

  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('text/csv')) return response.blob()
  if (contentType.includes('application/json')) return response.json()
  return null
}

export const httpClient = {
  get: (path, query) => request('GET', path, { query }),
  post: (path, body, query) => request('POST', path, { body, query }),
  put: (path, body) => request('PUT', path, { body }),
  patch: (path, body) => request('PATCH', path, { body }),
  delete: (path) => request('DELETE', path),
}
