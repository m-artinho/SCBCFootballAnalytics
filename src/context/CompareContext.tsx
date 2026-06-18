import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'

// In-memory only — the "compare selection" lives in React state, no persistence.
const MAX_COMPARE = 3

interface CompareContextValue {
  ids: string[]
  has: (id: string) => boolean
  toggle: (id: string) => void
  remove: (id: string) => void
  clear: () => void
  isFull: boolean
  max: number
}

const CompareContext = createContext<CompareContextValue | null>(null)

export function CompareProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([])

  const has = useCallback((id: string) => ids.includes(id), [ids])

  const toggle = useCallback((id: string) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (prev.length >= MAX_COMPARE) return prev // silently ignore past the cap
      return [...prev, id]
    })
  }, [])

  const remove = useCallback((id: string) => {
    setIds((prev) => prev.filter((x) => x !== id))
  }, [])

  const clear = useCallback(() => setIds([]), [])

  const value = useMemo<CompareContextValue>(
    () => ({ ids, has, toggle, remove, clear, isFull: ids.length >= MAX_COMPARE, max: MAX_COMPARE }),
    [ids, has, toggle, remove, clear],
  )

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext)
  if (!ctx) throw new Error('useCompare must be used within a CompareProvider')
  return ctx
}
