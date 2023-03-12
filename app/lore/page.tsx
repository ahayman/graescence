'use client'
import { useContext, useEffect, useMemo, useState } from 'react'
import { LoreData } from '../../api/contentData'
import Header from '../../components/Header/Header'
import Row from '../../components/Row'
import SearchField from '../../components/Search/SearchField'
import Tags from '../../components/Tags/Tags'
import { useStateDebouncer } from '../../lib/useStateDebouncert'
import { ContentContext } from '../../providers/Content/Provider'
import { DisplayContext } from '../../providers/Display/Provider'
import styles from './lore.module.scss'
import LoreItem from './loreItem'

type LoreViewData = {
  category: string
  items: LoreData[]
}

const includeLoreItem = (filter: string, item: LoreData): boolean => {
  if (item.title.includes(filter)) {
    return true
  }
  if (item.tags.find(t => t.includes(filter))) {
    return true
  }
  return false
}

const LoreHub = () => {
  const { lore } = useContext(ContentContext)
  const {
    state: { loreCategory, loreFilter },
    actions: { setLoreCategory, setLoreFilter },
  } = useContext(DisplayContext)
  const [activeFilter, filter, setFilter] = useStateDebouncer(loreFilter, 500)
  const categories = useMemo(() => ['All', ...Object.keys(lore.byCategory)], [lore.byCategory])
  const data: LoreViewData[] = useMemo(() => {
    const categoryLore = loreCategory && loreCategory !== 'All' ? lore.byCategory[loreCategory] : undefined
    const data =
      loreCategory && categoryLore
        ? [
            {
              category: loreCategory,
              items: categoryLore.map(idx => lore.items[idx]),
            },
          ]
        : Object.keys(lore.byCategory).map(category => ({
            category,
            items: lore.byCategory[category].map(idx => lore.items[idx]),
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
  }, [lore, loreCategory, loreFilter])

  useEffect(() => {
    if (loreFilter !== activeFilter) {
      setLoreFilter(activeFilter)
    }
  }, [loreFilter, activeFilter, setLoreFilter])

  return (
    <>
      <Header type="Primary">
        <Row vertical="center" horizontal="space-between" className={styles.tagsContainer}>
          <span>Lore</span>
          <SearchField text={filter} onChange={text => setFilter(text)} />
        </Row>
      </Header>
      <Row vertical="center" horizontal="start" className={styles.tagsContainer}>
        <Tags tags={categories} selected={loreCategory || 'All'} onSelect={setLoreCategory} />
      </Row>
      {data.map(viewData => (
        <section key={viewData.category}>
          <Header title={viewData.category} type="Secondary" />
          {viewData.items.map(item => (
            <LoreItem key={item.id} lore={item} />
          ))}
        </section>
      ))}
    </>
  )
}

export default LoreHub
