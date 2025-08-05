'use client'
import { useEffect, useMemo } from 'react'
import { HistoryExcerpt } from '../../../staticGenerator/types'
import Header from '../../Header/Header'
import Row from '../../Row'
import SearchField from '../../Search/SearchField'
import Tags from '../../Tags/Tags'
import { faSortAmountAsc, faSortAmountDesc } from '@fortawesome/free-solid-svg-icons'
import styles from './history.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useCategoricalFilter } from '../../../hooks/useCategoricalFilter'
import { getSortedHistoryData, SortDirection } from './utils/sortedHistoryData'
import { includeHistoryItem } from './utils/includeHistoryItem'
import { ExcerptItem } from '../../ExcerptItem/ExcerptItem'
import { useQueryParams } from '../../../hooks/useQueryParams'

export interface Props {
  historyData: HistoryExcerpt[]
}

type QueryParam = 'sort' | 'filter' | 'tag'

const HistoryHub = ({ historyData }: Props) => {
  const [params, setParam] = useQueryParams<QueryParam>()
  const tag = params['tag']
  const paramFilter = params['filter']
  const sort: SortDirection = params['sort'] === 'ascending' ? 'ascending' : 'descending'

  const { data, setFilter, setCategory, categories, currentCategory, filter } = useCategoricalFilter(
    historyData,
    includeHistoryItem,
    paramFilter,
    tag,
  )
  const sortedData = useMemo(() => getSortedHistoryData(data, sort), [data, sort])

  useEffect(() => setParam('filter', { filter, tag: currentCategory }), [currentCategory, filter, setParam])

  const renderByCategory = () =>
    sortedData.map(viewData => (
      <div className={styles.section} key={viewData.category}>
        <Header className={styles.sectionHeader} title={viewData.category} type="Secondary" />
        {viewData.data.map(item => (
          <ExcerptItem
            key={item.slug}
            tier="world"
            {...item}
            tags={item.turning ? [item.turning] : undefined}
            subTitle={`${item.startDate} → ${item.endDate}`}
            passThroughQuery={params}
            date={undefined}
          />
        ))}
      </div>
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
