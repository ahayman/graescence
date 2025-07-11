'use client'
import { useCallback, useEffect, useMemo } from 'react'
import { HistoryExcerpt } from '../../api/types'
import Header from '../../components/Header/Header'
import Row from '../../components/Row'
import SearchField from '../../components/Search/SearchField'
import Tags from '../../components/Tags/Tags'
import { faSortAmountAsc, faSortAmountDesc } from '@fortawesome/free-solid-svg-icons'
import styles from './history.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useCategoricalFilter } from '../../hooks/useCategoricalFilter'
import { getSortedHistoryData, SortDirection } from './utils/sortedHistoryData'
import { includeHistoryItem } from './utils/includeHistoryItem'
import { ExcerptItem } from '../../components/ExcerptItem/ExcerptItem'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createURL } from './utils/createURL'

export interface Props {
  historyData: HistoryExcerpt[]
}

const HistoryHub = ({ historyData }: Props) => {
  const router = useRouter()
  const path = usePathname() ?? ''
  const params = useSearchParams() ?? undefined
  const tag = params?.get('tag') ?? undefined
  const paramFilter = params?.get('filter') ?? undefined
  const sort: SortDirection = params?.get('sort') === 'ascending' ? 'ascending' : 'descending'

  const { data, setFilter, setCategory, categories, currentCategory, filter } = useCategoricalFilter(
    historyData,
    includeHistoryItem,
    paramFilter,
    tag,
  )
  const sortedData = useMemo(() => getSortedHistoryData(data, sort), [data, sort])

  const setParam = useCallback(
    (param: 'sort' | 'filter' | 'tag', value?: string) => {
      const newParams = new URLSearchParams(params)
      if (value) newParams.set(param, value)
      else newParams.delete(param)
      router.replace(createURL(path, newParams).toString())
    },
    [params, path, router],
  )

  useEffect(() => setParam('filter', filter), [filter, setParam])
  useEffect(() => setParam('tag', currentCategory), [setParam, currentCategory])

  const renderByCategory = () =>
    sortedData.map(viewData => (
      <section key={viewData.category}>
        <Header title={viewData.category} type="Secondary" />
        {viewData.data.map(item => (
          <ExcerptItem key={item.id} {...item} passThroughQuery={params} />
        ))}
      </section>
    ))

  return (
    <>
      <Header type="Primary" sticky>
        <Row vertical="center" horizontal="space-between" className={styles.tagsContainer}>
          <span style={{ marginRight: 5 }}>World History</span>
          <Tags tags={categories} selected={currentCategory} onSelect={setCategory} />
          <div style={{ flex: 1 }} />
          <FontAwesomeIcon
            className={styles.sortIcon}
            onClick={() => setParam('sort', sort === 'ascending' ? 'descending' : 'ascending')}
            icon={sort === 'ascending' ? faSortAmountAsc : faSortAmountDesc}
          />
          <SearchField text={filter} onChange={text => setFilter(text)} />
        </Row>
      </Header>
      {renderByCategory()}
    </>
  )
}

export default HistoryHub
