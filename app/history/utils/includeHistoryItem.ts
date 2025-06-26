import { HistoryMeta } from '../../../api/types'

export const includeHistoryItem = (item: HistoryMeta, filter: string): boolean => {
  return item.title.includes(filter) || item.tags.find(t => t.includes(filter)) !== undefined
}
