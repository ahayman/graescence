import { HistoryMeta } from '../../../staticGenerator/types'
import { CategorizedData } from '../../../hooks/useCategoricalFilter'

export type SortDirection = 'ascending' | 'descending'

export const getSortedHistoryData = <T extends HistoryMeta>(
  data: CategorizedData<T>[],
  sortDirection: SortDirection = 'descending',
) => {
  return data.map(d => ({
    category: d.category,
    data: d.data.toSorted((l, r) =>
      sortDirection === 'ascending'
        ? new Date(r.startDate).getTime() - new Date(l.startDate).getTime()
        : new Date(l.startDate).getTime() - new Date(r.startDate).getTime(),
    ),
  }))
}
