'use client'
import { useEffect, useState } from 'react'
import { LoreExcerpt } from '../../../staticGenerator/types'
import Header from '../../Header/Header'
import Row from '../../Row'
import SearchField from '../../Search/SearchField'
import Tags from '../../Tags/Tags'
import { faSortAlphaAsc, faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import styles from './lore.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useCategoricalFilter } from '../../../hooks/useCategoricalFilter'
import { ExcerptItem } from '../../ExcerptItem/ExcerptItem'
import { classes } from '../../../lib/utils'
import { useQueryParams } from '../../../hooks/useQueryParams'

const includeLoreItem = (item: LoreExcerpt, filter: string): boolean => {
  if (item.title.includes(filter)) {
    return true
  }
  if (item.tags.find(t => t.includes(filter))) {
    return true
  }
  return false
}

export interface Props {
  loreData: LoreExcerpt[]
}

type QueryParam = 'tag' | 'filter' | 'sort'

const LoreHub = ({ loreData }: Props) => {
  const [params, setParam] = useQueryParams<QueryParam>()
  const paramTag = params['tag']
  const paramFilter = params['filter']
  const sortByLatest = params['sort'] === 'byLatest'

  const { data, setFilter, setCategory, categories, currentCategory, filter } = useCategoricalFilter(
    loreData,
    includeLoreItem,
    paramFilter,
    paramTag,
  )

  const renderLoreByCategory = () =>
    data.map(viewData => (
      <section key={viewData.category}>
        <Header title={viewData.category} type="Secondary" />
        {viewData.data.map(item => (
          <ExcerptItem key={item.id} {...item} />
        ))}
      </section>
    ))

  const renderByLatest = () => {
    const allData = data
      .flatMap(d => d.data)
      .toSorted((l, r) => new Date(r.date).getTime() - new Date(l.date).getTime())
    return allData.map(item => <ExcerptItem key={item.id} {...item} />)
  }

  useEffect(() => setParam('filter', { filter, tag: currentCategory }), [currentCategory, filter, setParam])

  return (
    <>
      <Header type="Primary" sticky>
        <Row vertical="center" horizontal="space-between" className={styles.tagsContainer}>
          <span style={{ marginRight: 5 }}>Lore</span>
          <Tags tags={categories} selected={currentCategory} onSelect={setCategory} />
          <div style={{ flex: 1 }} />
          <Row vertical="center" className={styles.sortIconContainer}>
            <FontAwesomeIcon
              className={classes(styles.sortIcon, sortByLatest ? undefined : styles.selected)}
              onClick={() => setParam('sort', undefined)}
              icon={faSortAlphaAsc}
            />
            <div className={styles.vr} />
            <FontAwesomeIcon
              className={classes(styles.sortIcon, sortByLatest ? styles.selected : undefined)}
              onClick={() => setParam('sort', 'byLatest')}
              icon={faCalendarDays}
            />
          </Row>
          <SearchField text={filter} onChange={text => setFilter(text)} />
        </Row>
      </Header>
      {sortByLatest ? renderByLatest() : renderLoreByCategory()}
    </>
  )
}

export default LoreHub
