'use client'
import { TypedKeys } from '../../lib/utils'
import utilStyles from '../../styles/utils.module.scss'
import styles from './toc.module.scss'
import Date from '../../components/date'
import Link from 'next/link'
import { useContext, useEffect, useMemo, useState } from 'react'
import { ContentContext } from '../../providers/Content/Provider'
import Column from '../../components/Column'
import Header from '../../components/Header/Header'
import ContentBlock from '../../components/ContentBlock/ContentBlock'
import Row from '../../components/Row'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import Tags from '../../components/Tags/Tags'
import { IncludeFn } from '../../hooks/useFilter'
import { ChapterMeta } from '../../api/types'
import SearchField from '../../components/Search/SearchField'
import { DisplayContext } from '../../providers/Display/Provider'
import { useStateDebouncer } from '../../lib/useStateDebouncert'

const Include: IncludeFn<ChapterMeta> = (chapter, filter) => {
  if (chapter.title.includes(filter)) {
    return true
  }
  if (chapter.tags.filter(t => t.includes(filter)).length > 0) {
    return true
  }
  return false
}

type ChapaterViewData = {
  volume: string
  volNo: number
  chapters: ChapterMeta[]
}

const TOC = () => {
  const { chapters } = useContext(ContentContext)
  const {
    state: { chapterFilter, chapterTag },
    actions: { setChapterFilter, setChapterTag },
  } = useContext(DisplayContext)
  const [collapsed, setCollapsed] = useState<{ [k: number]: boolean }>({})
  const tags = useMemo(() => ['All', ...Object.keys(chapters.byTag).sort()], [chapters.byTag])
  const [activeFilter, filter, setFilter] = useStateDebouncer(chapterFilter, 500)

  const data: ChapaterViewData[] = useMemo(() => {
    const tagged = chapterTag && chapterTag !== 'All' ? chapters.byTag[chapterTag] : undefined
    //Filter Lore according to search
    const filtered = chapters.items.filter((chapter, idx) => {
      if (tagged && !tagged.includes(idx)) {
        return false
      }
      if (chapterFilter && !Include(chapter, chapterFilter)) {
        return false
      }
      return true
    })

    const byVolume: { [k: number]: ChapterMeta[] } = {}
    for (const c of filtered) {
      byVolume[c.volumeNo] = [...(byVolume[c.volumeNo] ?? []), c]
    }
    return TypedKeys(byVolume)
      .sort()
      .map(no => ({
        volNo: no,
        volume: `Volume ${no}${chapters.volumeName[no] ? ': ' + chapters.volumeName[no] : ''}`,
        chapters: byVolume[no],
      }))
  }, [chapters, chapterTag, chapterFilter])

  useEffect(() => {
    if (chapterFilter !== activeFilter) {
      setChapterFilter(activeFilter)
    }
  }, [chapterFilter, activeFilter, setChapterFilter])

  const toggleVolume = (vol: number) => {
    const col = { ...collapsed }
    const v = col[vol] ?? false
    col[vol] = !v
    setCollapsed(col)
  }

  return (
    <Column className={styles.container}>
      <Header type="Primary" title="Table of Contents" />
      <Row vertical="center" horizontal="space-between" className={styles.tagsContainer}>
        <Tags tags={tags} selected={chapterTag || 'All'} onSelect={setChapterTag} />
        <SearchField text={filter} onChange={setFilter} />
      </Row>
      {data.map(vol => (
        <Column key={vol.volume}>
          <Header type="Secondary">
            <Row horizontal="space-between" vertical="center" onClick={() => toggleVolume(vol.volNo)}>
              <Row horizontal="start" vertical="center">
                <span>{vol.volume}</span>
                {collapsed[vol.volNo] && (
                  <span style={{ marginLeft: 10, fontSize: 12 }}>{`(${vol.chapters.length} Chapters)`}</span>
                )}
              </Row>
              <FontAwesomeIcon icon={collapsed[vol.volNo] ? faChevronDown : faChevronUp} className={styles.icon} />
            </Row>
          </Header>
          {!collapsed[vol.volNo] && (
            <ContentBlock>
              {vol.chapters.map(({ id, tags, date, title, chapterNo }) => (
                <Link href={`/chapters/${id}`} key={id}>
                  <Row horizontal="center" className={styles.chapterRow}>
                    <div className={styles.chapterTitle}>
                      {chapterNo} | {title}
                    </div>
                    <Tags tags={tags} />
                    <div style={{ flex: 1 }} />
                    {date && (
                      <div className={[utilStyles.lightText, utilStyles.smallText].join(' ')}>
                        <Date dateString={date} />
                      </div>
                    )}
                  </Row>
                </Link>
              ))}
            </ContentBlock>
          )}
        </Column>
      ))}
    </Column>
  )
}
export default TOC
