'use client'
import { TypedKeys } from '../../lib/utils'
import utilStyles from '../../styles/utils.module.scss'
import styles from './toc.module.scss'
import Date from '../../components/date'
import Link from 'next/link'
import { useContext, useMemo, useState } from 'react'
import { ContentContext } from '../../providers/Content/Provider'
import Column from '../../components/Column'
import Header from '../../components/Header/Header'
import ContentBlock from '../../components/ContentBlock/ContentBlock'
import Row from '../../components/Row'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import Tags from '../../components/Tags/Tags'
import { useTagSelect } from '../../hooks/useTagSelect'
import { IncludeFn, useFilter } from '../../hooks/useFilter'
import { ChapterData } from '../../api/contentData'
import SearchField from '../../components/Search/SearchField'

const Include: IncludeFn<ChapterData> = (chapter, filter) => {
  if (chapter.title.includes(filter)) {
    return true
  }
  if (chapter.tags.filter(t => t.includes(filter)).length > 0) {
    return true
  }
  return false
}

const TOC = () => {
  const { chapters } = useContext(ContentContext)
  const volumes = TypedKeys(chapters.byVolume).sort()
  const [collapsed, setCollapsed] = useState<{ [k: number]: boolean }>({})
  const { tagFiltered, selectedTag, tags, onSelectTag } = useTagSelect(
    chapters.items,
    Object.keys(chapters.byTag),
    d => d.tags,
  )
  const { filtered, onFilter, filter } = useFilter(tagFiltered, Include)
  const volumeData = useMemo(() => {
    const byVolume: { [k: number]: ChapterData[] } = {}
    for (const c of filtered) {
      byVolume[c.volumeNo] = [...(byVolume[c.volumeNo] ?? []), c]
    }
    return byVolume
  }, [filtered])

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
        <Tags tags={tags} selected={selectedTag} onSelect={onSelectTag} />
        <SearchField text={filter} onChange={onFilter} />
      </Row>
      {volumes.map(vol => (
        <>
          <Header type="Secondary">
            <Row horizontal="space-between" onClick={() => toggleVolume(vol)}>
              <span>{`Volume ${vol}: ${chapters.volumeName[vol]}`}</span>
              {collapsed[vol] && <span>{`${volumeData[vol]?.length ?? 0} Chapters`}</span>}
              <FontAwesomeIcon icon={collapsed[vol] ? faChevronDown : faChevronUp} className={styles.icon} />
            </Row>
          </Header>
          {!collapsed[vol] && (
            <ContentBlock>
              {volumeData[vol]?.map(({ id, tags, date, title, chapterNo }) => (
                <Link href={`/chapters/${id}`} key={id}>
                  <Row className={styles.chapterRow}>
                    <h4 className={styles.chapterTitle}>{`${chapterNo} | ${title}`}</h4>
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
        </>
      ))}
    </Column>
  )
}
export default TOC
