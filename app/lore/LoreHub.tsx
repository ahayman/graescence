'use client'
import { useContext, useEffect, useMemo, useState } from 'react'
import { LoreExcerpt, LoreMeta } from '../../api/types'
import Header from '../../components/Header/Header'
import Row from '../../components/Row'
import SearchField from '../../components/Search/SearchField'
import Tags from '../../components/Tags/Tags'
import { useStateDebouncer } from '../../lib/useStateDebouncert'
import { ContentContext } from '../../providers/Content/Provider'
import { DisplayContext } from '../../providers/Display/Provider'
import { faSortAlphaAsc, faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import styles from './lore.module.scss'
import LoreItem from './loreItem'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type LoreViewData = {
  category: string
  items: LoreExcerpt[]
}

const includeLoreItem = (filter: string, item: LoreExcerpt): boolean => {
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
  const { lore } = useContext(ContentContext)
  const {
    state: { loreCategory, loreFilter },
    actions: { setLoreCategory, setLoreFilter },
  } = useContext(DisplayContext)
  const [showByLatest, setShowByLatest] = useState(showLatest ?? false)
  const [activeFilter, filter, setFilter] = useStateDebouncer(loreFilter, 500)
  const categories = useMemo(() => ['All', ...Object.keys(lore.byCategory)], [lore.byCategory])
  const data: LoreViewData[] = useMemo(() => {
    const categoryLore = loreCategory && loreCategory !== 'All' ? lore.byCategory[loreCategory] : undefined
    const data =
      loreCategory && categoryLore
        ? [
            {
              category: loreCategory,
              items: categoryLore.map(idx => loreData[idx]),
            },
          ]
        : Object.keys(lore.byCategory).map(category => ({
            category,
            items: lore.byCategory[category].map(idx => loreData[idx]),
          }))
    if (!loreFilter) {
      return data
    }
    //Filter Lore according to search
    const filteredLore = data.map(({ category, items }) => ({
      category,
      items: items.filter(i => includeLoreItem(loreFilter, i)),
    }))
    //Filter out categories with no items, and return
    return filteredLore.filter(l => l.items.length > 0)
  }, [lore, loreCategory, loreFilter, loreData])

  const dataByLatest = useMemo(() => {
    if (!showByLatest) return []
    const data = loreFilter ? loreData.filter(i => includeLoreItem(loreFilter, i)) : loreData
    return data.toSorted((l, r) => new Date(r.date).getTime() - new Date(l.date).getTime())
  }, [loreFilter, loreData, showByLatest])

  useEffect(() => {
    if (loreFilter !== activeFilter) {
      setLoreFilter(activeFilter)
    }
  }, [loreFilter, activeFilter, setLoreFilter])

  const renderLoreByCategory = () =>
    data.map(viewData => (
      <section key={viewData.category}>
        <Header title={viewData.category} type="Secondary" />
        {viewData.items.map(item => (
          <LoreItem key={item.id} lore={item} />
        ))}
      </section>
    ))

  const renderByLatest = () => dataByLatest.map(item => <LoreItem key={item.id} lore={item} />)

  return (
    <>
      <Header type="Primary" sticky>
        <Row vertical="center" horizontal="space-between" className={styles.tagsContainer}>
          <span style={{ marginRight: 5 }}>Lore</span>
          <Tags tags={categories} selected={loreCategory || 'All'} onSelect={setLoreCategory} />
          <div style={{ flex: 1 }} />
          <FontAwesomeIcon
            className={styles.sortIcon}
            onClick={() => setShowByLatest(c => !c)}
            icon={showByLatest ? faCalendarDays : faSortAlphaAsc}
          />
          <SearchField text={filter} onChange={text => setFilter(text)} />
        </Row>
      </Header>
      {showByLatest ? renderByLatest() : renderLoreByCategory()}
    </>
  )
}

export default LoreHub
