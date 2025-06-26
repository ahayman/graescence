'use client'
import { useContext, useEffect, useMemo, useState } from 'react'
import { HistoryExcerpt } from '../../api/types'
import Header from '../../components/Header/Header'
import Row from '../../components/Row'
import SearchField from '../../components/Search/SearchField'
import Tags from '../../components/Tags/Tags'
import { faSortAmountAsc, faSortAmountDesc } from '@fortawesome/free-solid-svg-icons'
import styles from './history.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useCategoricalFilter } from '../../hooks/useCategoricalFilter'
import { DisplayContext } from '../../providers/Display/Provider'
import { getSortedHistoryData } from './utils/sortedHistoryData'
import { includeHistoryItem } from './utils/includeHistoryItem'
import { ExcerptItem } from '../../components/ExcerptItem/ExcerptItem'

export interface Props {
  historyData: HistoryExcerpt[]
}

const LoreHub = ({ historyData }: Props) => {
  const {
    state: { historyCategory, historyFilter, historySortDirection },
    actions: { setHistoryCategory, setHistoryFilter, setHistorySortDirection },
  } = useContext(DisplayContext)
  const [sortDirection, setSortDirection] = useState<'ascending' | 'descending'>(historySortDirection)
  const { data, setFilter, setCategory, categories, currentCategory, filter } = useCategoricalFilter(
    historyData,
    includeHistoryItem,
    historyFilter,
    historyCategory,
  )
  const sortedData = useMemo(() => getSortedHistoryData(data, sortDirection), [data, sortDirection])

  /** Update Contexts */
  useEffect(() => setHistoryCategory(currentCategory), [currentCategory, setHistoryCategory])
  useEffect(() => setHistoryFilter(historyFilter), [historyFilter, setHistoryFilter])
  useEffect(() => setHistorySortDirection(sortDirection), [setHistorySortDirection, sortDirection])

  const renderByCategory = () =>
    sortedData.map(viewData => (
      <section key={viewData.category}>
        <Header title={viewData.category} type="Secondary" />
        {viewData.data.map(item => (
          <ExcerptItem key={item.id} {...item} />
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
            onClick={() => setSortDirection(c => (c === 'ascending' ? 'descending' : 'ascending'))}
            icon={sortDirection === 'ascending' ? faSortAmountAsc : faSortAmountDesc}
          />
          <SearchField text={filter} onChange={text => setFilter(text)} />
        </Row>
      </Header>
      {renderByCategory()}
    </>
  )
}

export default LoreHub
