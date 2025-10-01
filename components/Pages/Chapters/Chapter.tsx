'use client'
import ReadingOptions from '../../ReadingOptions/ReadingOptions'
import Row from '../../Row'
import { PointerEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ContentContext } from '../../../providers/Content/Provider'
import Header from '../../Header/Header'
import Tags from '../../Tags/Tags'
import { faNoteSticky, faListSquares, faSliders, faClose } from '@fortawesome/free-solid-svg-icons'
import Popover from '../../Popover/Popover'
import ChapterLore from './ChapterLore'
import { ChapterData, ChapterMeta, LoreData } from '../../../staticGenerator/types'
import Column from '../../Column'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ExcerptItem } from '../../ExcerptItem/ExcerptItem'
import { NavLink, Reader } from '../../Reader/Reader'

import styles from './chapter.module.scss'
import postStyles from '../../../styles/post.module.scss'
import utilStyles from '../../../styles/utils.module.scss'

export type Props = {
  id: string
  chapter: ChapterData
}

const ChapterLoreItem = ({ lore, dismiss }: { lore: LoreData; dismiss: () => void }) => (
  <Column>
    <Row className={styles.lorePopoverHeader} horizontal="end">
      <FontAwesomeIcon icon={faClose} onClick={dismiss} />
    </Row>
    <ExcerptItem tier="world" {...lore} />
  </Column>
)

const Chapter = ({ id, chapter }: Props) => {
  const { chapterNo, title, tags, notes } = chapter
  const [lorePopover, setLorePopover] = useState<LoreData>()
  const { chapters } = useContext(ContentContext)
  const chapterIdx = useMemo(() => chapters.findIndex(c => c.slug === id), [chapters, id])
  const nextChapter: ChapterMeta | undefined = chapters[chapterIdx + 1]
  const prevChapter: ChapterMeta | undefined = chapters[chapterIdx - 1]
  const next: NavLink | undefined = nextChapter
    ? { title: 'Next Chapter', url: `/chapters/${nextChapter.slug}` }
    : undefined
  const prev: NavLink | undefined = prevChapter
    ? { title: 'Prev Chapter', url: `/chapters/${prevChapter.slug}` }
    : undefined

  const onLoreClick = useCallback(
    (tag: string) => {
      let lore: LoreData | undefined
      for (const l of chapter.lore) {
        if (l.tags.find(t => tag === t)) {
          lore = l
          break
        }
      }
      setLorePopover(lore)
    },
    [chapter.lore],
  )

  const LorePopover = (lore: LoreData) => (
    <Column vertical="center" onClick={() => setLorePopover(undefined)} className={styles.lorePopoverBackground}>
      <ChapterLoreItem lore={lore} dismiss={() => setLorePopover(undefined)} />
    </Column>
  )

  return (
    <div id="chapter-main" className={utilStyles.pageMain}>
      <Header type="Primary">
        <Row horizontal="space-between" vertical="center">
          <Row>
            <div style={{ marginRight: 5 }}>{`${chapterNo} | ${title}`}</div>
            <Tags tags={tags} />
          </Row>
          <Row>
            <Popover icon={faSliders} name="ReadingOptions">
              <ReadingOptions />
            </Popover>
            {!!notes && (
              <Popover style={{ marginLeft: 20 }} icon={faNoteSticky} name="ChapterNotes">
                <Header type="Secondary" title="Author Notes" />
                <div style={{ padding: 5 }} className={postStyles.post} dangerouslySetInnerHTML={{ __html: notes }} />
              </Popover>
            )}
            {chapter.lore.length > 0 && (
              <Popover style={{ marginLeft: 20 }} icon={faListSquares} name="ChapterLore">
                <ChapterLore data={chapter.lore} />
              </Popover>
            )}
          </Row>
        </Row>
      </Header>
      <Reader {...chapter} tier="story" nav={{ next, prev }} onLore={onLoreClick} />
      {lorePopover && LorePopover(lorePopover)}
    </div>
  )
}
export default Chapter
