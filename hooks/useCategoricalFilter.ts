import { useMemo, useState } from 'react'
import { useStateDebouncer } from '../lib/useStateDebouncert'

type CategoricalData = {
  category: string
}

export type Data<T extends CategoricalData> = {
  data: CategorizedData<T>[]
  setFilter: (filter: string) => void
  setCategory: (category: 'All' | string) => void
  categories: string[]
  currentCategory: 'All' | string
  filter: string
}
export type IncludeFn<T extends CategoricalData> = (item: T, filter: string) => boolean

export type CategorizedData<T extends CategoricalData> = { category: string; data: T[] }

export const useCategoricalFilter = <T extends CategoricalData>(
  data: T[],
  include: IncludeFn<T>,
  initialFilter: string = '',
  initialCategory: 'All' | string = 'All',
  debounce: number = 500,
): Data<T> => {
  const categories = useMemo(() => ['All', ...new Set(data.map(d => d.category))], [data])
  const [category, setCategory] = useState<'All' | string>(
    categories.includes(initialCategory) ? initialCategory : 'All',
  )
  const [activeFilter, filter, onFilter] = useStateDebouncer(initialFilter, debounce ?? 500)

  const filtered = useMemo(() => {
    return activeFilter ? data.filter(d => include(d, activeFilter)) : data
  }, [data, activeFilter, include])

  const categorizedData = useMemo(() => {
    const categoricalData: { [key: string]: T[] } = {}
    filtered.forEach(item => {
      if (category !== 'All' && item.category !== category) return
      if (!categoricalData[item.category]) {
        categoricalData[item.category] = []
      }
      categoricalData[item.category].push(item as T)
    })
    return Object.entries(categoricalData)
      .sort()
      .map(([cat, items]) => ({
        category: cat,
        data: items,
      }))
  }, [category, filtered])

  return { data: categorizedData, setFilter: onFilter, filter, categories, currentCategory: category, setCategory }
}
