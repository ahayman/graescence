'use client'
import Link from 'next/link'
import { useContext, useMemo, useState } from 'react'
import { LoreData } from '../../api/contentData'
import ContentBlock from '../../components/ContentBlock/ContentBlock'
import Header from '../../components/Header/Header'
import Row from '../../components/Row'
import SearchField from '../../components/Search/SearchField'
import Tags from '../../components/Tags/Tags'
import { useStateDebouncer } from '../../lib/useStateDebouncert'
import { ContentContext } from '../../providers/Content/Provider'
import postStyles from '../../styles/post.module.scss'
import utilStyles from '../../styles/utils.module.scss'
import styles from './lore.module.scss'

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

type AllCategory = 'All'
const allCategory: AllCategory = 'All'
type Category = AllCategory | string

const LoreHub = () => {
  const { lore } = useContext(ContentContext)
  const [category, setCategory] = useState<Category>('All')
  const [activeFilter, filter, setFilter] = useStateDebouncer('', 500)
  const categories = useMemo<Category[]>(() => [allCategory, ...Object.keys(lore.byCategory)], [lore.byCategory])
  const data: LoreViewData[] = useMemo(() => {
    const categoryLore = category !== 'All' ? lore.byCategory[category] : undefined
    const data = categoryLore
      ? [
          {
            category,
            items: categoryLore.map(idx => lore.items[idx]),
          },
        ]
      : Object.keys(lore.byCategory).map(category => ({
          category,
          items: lore.byCategory[category].map(idx => lore.items[idx]),
        }))
    if (!activeFilter) {
      return data
    }
    //Filter Lore according to search
    const filteredLore = data.map(({ category, items }) => ({
      category,
      items: items.filter(i => includeLoreItem(activeFilter, i)),
    }))
    //Filter out categories with no items, and return
    return filteredLore.filter(l => l.items.length > 0)
  }, [lore, category, activeFilter])

  return (
    <>
      <Header type="Primary">
        <Row vertical="center" horizontal="space-between" className={styles.tagsContainer}>
          <span>Lore</span>
          <SearchField text={filter} onChange={text => setFilter(text)} />
        </Row>
      </Header>
      <Row vertical="center" horizontal="start" className={styles.tagsContainer}>
        <Tags tags={categories} selected={category} onSelect={setCategory} />
      </Row>
      {data.map(viewData => (
        <section key={viewData.category}>
          <Header title={viewData.category} type="Secondary" />
          {viewData.items.map(item => (
            <ContentBlock key={item.id}>
              <Link href={`/lore/${item.id}`}>
                <h4>{item.title}</h4>
              </Link>
              <div className={styles.tagsRow}>
                <Tags tags={item.tags} />
              </div>
              <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: item.excerpt }} />
              {item.excerpt.length < item.html.length && (
                <Row horizontal="end">
                  <Link className={utilStyles.coloredLink} href={`/lore/${item.id}`}>
                    {'More →'}
                  </Link>
                </Row>
              )}
            </ContentBlock>
          ))}
          <br />
        </section>
      ))}
    </>
  )
}

export default LoreHub
