import { useCallback, useRef, useState } from 'react'

/**
 * Hook de mutação genérico (criar, editar, excluir, comprar, vender...).
 * Única responsabilidade: controlar o estado de envio e o erro de uma ação,
 * para o componente só desenhar o botão desabilitado e a mensagem
 * (frontend-conventions, "Mensagens de sucesso e de recusa com proteção
 * contra duplo clique" — `isPending` é o que desabilita o botão).
 *
 * O travamento usa uma ref, não o estado: dois cliques disparados antes do
 * primeiro re-render (ex.: duplo clique rápido) ainda precisam resultar em
 * só um pedido, e `status` só atualiza no próximo render.
 */
export function useAsyncAction(actionFn) {
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const isRunningRef = useRef(false)

  const run = useCallback(
    async (...args) => {
      if (isRunningRef.current) return undefined
      isRunningRef.current = true
      setStatus('pending')
      setErrorMessage('')
      setFieldErrors({})
      try {
        const result = await actionFn(...args)
        setStatus('success')
        return result
      } catch (error) {
        setErrorMessage(error.message)
        const errosDeCampo = {}
        for (const erro of error.errors ?? []) {
          if (erro.field) errosDeCampo[erro.field] = erro.message
        }
        setFieldErrors(errosDeCampo)
        setStatus('error')
        throw error
      } finally {
        isRunningRef.current = false
      }
    },
    [actionFn],
  )

  const reset = useCallback(() => {
    setStatus('idle')
    setErrorMessage('')
    setFieldErrors({})
  }, [])

  return {
    run,
    reset,
    status,
    errorMessage,
    fieldErrors,
    isPending: status === 'pending',
  }
}
