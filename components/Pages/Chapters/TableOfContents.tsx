'use client'
import { classes, TierData, TypedKeys, userCanAccessTier } from '../../../lib/utils'
import utilStyles from '../../../styles/utils.module.scss'
import styles from './toc.module.scss'
import Date from '../../date'
import Link from 'next/link'
import { useContext, useEffect, useMemo, useState } from 'react'
import { ContentContext } from '../../../providers/Content/Provider'
import Column from '../../Column'
import Header from '../../Header/Header'
import ContentBlock from '../../ContentBlock/ContentBlock'
import Row from '../../Row'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp, faPenFancy } from '@fortawesome/free-solid-svg-icons'
import Tags from '../../Tags/Tags'
import { ChapterMeta } from '../../../staticGenerator/types'
import SearchField from '../../Search/SearchField'
import { useStateDebouncer } from '../../../hooks/useStateDebouncer'
import { useStructuredChapterData } from './useStructuredChapterData'
import { useQueryParams } from '../../../hooks/useQueryParams'
import { PatreonContext } from '../../../providers/Patreon/Provider'
import { AccessNeeded } from '../../Patreon/AccessNeeded'

const includeChapter = (chapter: ChapterMeta, filter: string) => {
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

type QueryParam = 'tag' | 'filter'

export const TableOfContents = () => {
  const { chapters } = useContext(ContentContext)
  const chapterData = useStructuredChapterData(chapters)
  const [params, setParam] = useQueryParams<QueryParam>()
  const tag = params['tag'] ?? 'All'
  const paramFilter = params['filter']
  const [collapsed, setCollapsed] = useState<{ [k: number]: boolean }>({})
  const tags = useMemo(() => ['All', ...Object.keys(chapterData.byTag).sort()], [chapterData.byTag])
  const [activeFilter, filter, setFilter] = useStateDebouncer(paramFilter, 500)
  const {
    state: { user },
  } = useContext(PatreonContext)
  const hasPatreonAccess = userCanAccessTier(user, 'story')

  const data: ChapaterViewData[] = useMemo(() => {
    const tagged = tag !== 'All' ? chapterData.byTag[tag] : undefined
    //Filter Lore according to search
    const filtered = chapterData.items.filter((chapter, idx) => {
      if (tagged && !tagged.includes(idx)) {
        return false
      } else if (activeFilter && !includeChapter(chapter, activeFilter)) {
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
        volume: `Volume ${no}${chapterData.volumeName[no] ? ': ' + chapterData.volumeName[no] : ''}`,
        chapters: byVolume[no],
      }))
  }, [tag, chapterData.byTag, chapterData.items, chapterData.volumeName, activeFilter])

  useEffect(() => setParam('filter', activeFilter), [activeFilter, setParam])

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
        <Tags tags={tags} selected={tag} onSelect={tag => setParam('tag', tag)} />
        <SearchField text={filter} onChange={setFilter} />
      </Row>
      {data.map(vol => (
        <Column className={styles.volumeContainer} key={vol.volume}>
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
              {vol.chapters.map(({ id, tags, date, title, chapterNo, isPublic }) => (
                <Link href={`/chapters/${id}`} key={id}>
                  <Row vertical="center" horizontal="center" className={styles.chapterRow}>
                    <div className={styles.chapterTitle}>
                      {chapterNo} | {title}
                    </div>
                    <Tags tags={tags} onSelect={() => undefined} />
                    <div style={{ flex: 1 }} />
                    {!(isPublic || hasPatreonAccess) && (
                      <AccessNeeded
                        className={styles.accessContainer}
                        tier="story"
                        content=""
                        isAlreadyLinked={user !== undefined}
                      />
                    )}
                    {!isPublic && hasPatreonAccess && (
                      <FontAwesomeIcon className={styles.storyIcon} icon={TierData.story.icon} />
                    )}
                    {date && (
                      <div className={classes(utilStyles.lightText, utilStyles.smallText, styles.chapterDate)}>
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
