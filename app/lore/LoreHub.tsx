'use client'
import { useState } from 'react'
import { LoreExcerpt } from '../../api/types'
import Header from '../../components/Header/Header'
import Row from '../../components/Row'
import SearchField from '../../components/Search/SearchField'
import Tags from '../../components/Tags/Tags'
import { faSortAlphaAsc, faCalendarDays, faSortAsc, faTimeline } from '@fortawesome/free-solid-svg-icons'
import styles from './lore.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useCategoricalFilter } from '../../hooks/useCategoricalFilter'
import { ExcerptItem } from '../../components/ExcerptItem/ExcerptItem'
import { classes } from '../../lib/utils'
import { faCalendarTimes } from '@fortawesome/free-regular-svg-icons'

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
  showLatest?: boolean
}

const LoreHub = ({ loreData, showLatest }: Props) => {
  const [showByLatest, setShowByLatest] = useState(showLatest ?? false)
  const { data, setFilter, setCategory, categories, currentCategory, filter } = useCategoricalFilter(
    loreData,
    includeLoreItem,
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

  return (
    <>
      <Header type="Primary" sticky>
        <Row vertical="center" horizontal="space-between" className={styles.tagsContainer}>
          <span style={{ marginRight: 5 }}>Lore</span>
          <Tags tags={categories} selected={currentCategory} onSelect={setCategory} />
          <div style={{ flex: 1 }} />
          <Row vertical="center" className={styles.sortIconContainer}>
            <FontAwesomeIcon
              className={classes(styles.sortIcon, showByLatest ? undefined : styles.selected)}
              onClick={() => setShowByLatest(c => !c)}
              icon={faSortAlphaAsc}
            />
            <div className={styles.vr} />
            <FontAwesomeIcon
              className={classes(styles.sortIcon, showByLatest ? styles.selected : undefined)}
              onClick={() => setShowByLatest(c => !c)}
              icon={faCalendarDays}
            />
          </Row>
          <SearchField text={filter} onChange={text => setFilter(text)} />
        </Row>
      </Header>
      {showByLatest ? renderByLatest() : renderLoreByCategory()}
    </>
  )
}

export default LoreHub
