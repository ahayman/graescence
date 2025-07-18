'use client'
import ReadingOptions from '../../ReadingOptions/ReadingOptions'
import Row from '../../Row'
import { PointerEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ContentContext } from '../../../providers/Content/Provider'
import Header from '../../Header/Header'
import Tags from '../../Tags/Tags'
import { classes, userCanAccessTier } from '../../../lib/utils'
import Link from 'next/link'
import { ProgressContext } from '../../../providers/Progress/Provider'
import { faNoteSticky, faListSquares, faSliders, faClose } from '@fortawesome/free-solid-svg-icons'
import Popover from '../../Popover/Popover'
import ChapterLore from './ChapterLore'
import { ChapterData, ChapterMeta, LoreData } from '../../../staticGenerator/types'
import Column from '../../Column'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useStateDebouncer } from '../../../hooks/useStateDebouncer'
import { ScrollIndicator } from '../../ScrollIndicator/ScrollIndicator'
import { OptionsContext } from '../../../providers/Options/Provider'
import { DisplayContext } from '../../../providers/Display/Provider'
import { PatreonContext } from '../../../providers/Patreon/Provider'
import { AccessNeeded } from '../../Patreon/AccessNeeded'
import { ExcerptItem } from '../../ExcerptItem/ExcerptItem'
import { NavLink, Reader } from '../../Reader/Reader'

import styles from './chapter.module.scss'
import postStyles from '../../../styles/post.module.scss'
import utilStyles from '../../../styles/utils.module.scss'

export type Props = {
  id: string
  chapter: ChapterData
}

type LorePopoverState = {
  lore: LoreData
  position: { x: number; y: number }
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
  const [lorePopover, setLorePopover] = useState<LorePopoverState>()
  const { chapters } = useContext(ContentContext)
  const chapterIdx = useMemo(() => chapters.findIndex(c => c.id === id), [chapters, id])
  const nextChapter: ChapterMeta | undefined = chapters[chapterIdx + 1]
  const prevChapter: ChapterMeta | undefined = chapters[chapterIdx - 1]
  const next: NavLink | undefined = nextChapter ? { title: 'Next', url: `/chapters/${nextChapter.id}` } : undefined
  const prev: NavLink | undefined = prevChapter ? { title: 'Prev', url: `/chapters/${prevChapter.id}` } : undefined

  const onLoreClick = useCallback(
    (event: Event) => {
      const pointerEvent = event as unknown as PointerEvent
      const position = { x: pointerEvent.screenX, y: pointerEvent.screenY }
      const targetElement: Element = event.target as unknown as Element
      const tag = targetElement?.firstChild?.nodeValue
      if (!tag) return
      let lore: LoreData | undefined
      for (const l of chapter.lore) {
        if (l.tags.find(t => tag === t)) {
          lore = l
          break
        }
      }
      setLorePopover(lore ? { lore, position } : undefined)
    },
    [chapter.lore],
  )

  useEffect(() => {
    const lore = Array.from(document.getElementsByClassName('loreHighlight'))
    for (const elem of lore) {
      elem.addEventListener('click', onLoreClick)
    }
    return () => {
      for (const elem of lore) {
        elem.removeEventListener('click', onLoreClick)
      }
    }
  })

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
      <Reader {...chapter} tier="story" nav={{ next, prev }} />
      {lorePopover && LorePopover(lorePopover.lore)}
    </div>
  )
}
export default Chapter
