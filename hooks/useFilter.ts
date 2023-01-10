import { useMemo } from 'react'
import { useStateDebouncer } from '../lib/useStateDebouncert'

export type Data<T> = {
  filtered: T[]
  onFilter: (filter: string) => void
  filter: string
}
export type IncludeFn<T> = (item: T, filter: string) => boolean

export const useFilter = <T>(data: T[], include: IncludeFn<T>, debounce: number = 500): Data<T> => {
  const [activeFilter, filter, onFilter] = useStateDebouncer('', debounce ?? 500)
  const filtered = useMemo(() => {
    return activeFilter ? data.filter(d => include(d, activeFilter)) : data
  }, [data, activeFilter, include])

  return { filtered, onFilter, filter }
}
