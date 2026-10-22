import { useEffect, useState, useCallback } from 'react'

/**
 * Hook de dados genérico: orquestra os estados de carregando, vazio e erro
 * para uma busca assíncrona, deixando o componente responsável apenas por
 * renderizar o resultado.
 *
 * `fetchFn` deve ser estável entre renders com os mesmos filtros — quem
 * chama normalmente passa uma função nova a cada render, por isso o hook
 * também recebe `deps` (o array de dependências do efeito).
 */
export function useQuery(fetchFn, deps) {
  const [state, setState] = useState('loading')
  const [data, setData] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState('loading')

    fetchFn()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setState('ready')
      })
      .catch((error) => {
        if (cancelled) return
        setErrorMessage(error.message)
        setState('error')
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken])

  const reload = useCallback(() => setReloadToken((token) => token + 1), [])

  return { data, state, errorMessage, reload }
}
