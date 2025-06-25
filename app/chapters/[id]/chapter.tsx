'use client'
import Date from '../../../components/date'
import utilStyles from '../../../styles/utils.module.scss'
import postStyles from '../../../styles/post.module.scss'
import styles from './chapter.module.scss'
import ReadingOptions from '../../../components/ReadingOptions/ReadingOptions'
import Row from '../../../components/Row'
import { PointerEvent, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ContentContext } from '../../../providers/Content/Provider'
import ContentBlock from '../../../components/ContentBlock/ContentBlock'
import Header from '../../../components/Header/Header'
import Tags from '../../../components/Tags/Tags'
import { classes } from '../../../lib/utils'
import Link from 'next/link'
import { ProgressContext } from '../../../providers/Progress/Provider'
import { faNoteSticky, faListSquares, faSliders, faClose } from '@fortawesome/free-solid-svg-icons'
import Popover from '../../../components/Popover/Popover'
import ChapterLore from './chapterLore'
import { ChapterData, LoreData } from '../../../api/types'
import Column from '../../../components/Column'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export type Props = {
  id: string
  chapter: ChapterData
}

type LorePopoverState = {
  lore: LoreData
  position: { x: number; y: number }
}

const ChapterLoreItem = ({ lore, dismiss }: { lore: LoreData; dismiss: () => void }) => (
  <Column key={lore.id} className={styles.lorePopoverContainer}>
    <Header type="Secondary" title={lore.title} className={styles.lorePopoverHeader}>
      <FontAwesomeIcon icon={faClose} onClick={dismiss} />
    </Header>
    <div className={styles.lorePopoverContent}>
      <div className={styles.tagsRow}>
        <Tags tags={lore.tags} />
      </div>
      <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: lore.excerpt }} />
      <Row horizontal="end">
        <Link className={utilStyles.coloredLink} href={`/lore/${lore.id}`}>
          {'More →'}
        </Link>
      </Row>
    </div>
  </Column>
)

const Chapter = ({ id, chapter }: Props) => {
  const [lorePopover, setLorePopover] = useState<LorePopoverState>()
  const { chapters } = useContext(ContentContext)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const autoScroll = useRef(true)
  const {
    state: { chapterProgress },
    actions: { updateCurrentChapter },
  } = useContext(ProgressContext)
  const chapterIdx = chapters.byID[id]
  const nextChapter = chapters.items[chapterIdx + 1]
  const prevChapter = chapters.items[chapterIdx - 1]

  const scrollTo = useCallback((progress: number) => {
    const scrollable = document.getElementById('main-content-container')
    if (scrollable === null) return
    const height = scrollable.scrollHeight
    const scrollOffset = height * progress
    scrollable.scrollTo(0, scrollOffset)
  }, [])

  const setScrollProgress = useCallback(() => {
    const scrollable = document.getElementById('main-content-container')
    if (scrollable === null) return
    const height = scrollable.scrollHeight
    const offset = scrollable.scrollTop
    if (height <= 0) return
    const progress = offset / height
    updateCurrentChapter(chapter.id, progress)
  }, [updateCurrentChapter, chapter.id])

  const onScroll = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = undefined
      setScrollProgress()
    }, 1000)
  }, [setScrollProgress])

  const onResize = useCallback(() => {
    const progress = chapterProgress[chapter.id]
    if (progress === undefined) return
    scrollTo(progress)
  }, [chapter.id, scrollTo, chapterProgress])

  const onLoreClick = useCallback(
    (event: Event) => {
      const pointerEvent = event as unknown as PointerEvent
      const position = { x: pointerEvent.screenX, y: pointerEvent.screenY }
      const targetElement: Element = event.target as unknown as Element
      const tag = targetElement?.firstChild?.nodeValue
      console.log('Lore Clicked! : ', tag)
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
    updateCurrentChapter(chapter.id)
    const scrollable = document.getElementById('main-content-container')
    scrollable?.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      scrollable?.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [chapter, onScroll, onResize, updateCurrentChapter])

  useEffect(() => {
    const progress = chapterProgress[chapter.id]
    // if (!autoScroll.current) return
    // autoScroll.current = false
    if (progress === undefined) return
    scrollTo(progress)
  }, [chapter.id, autoScroll, chapterProgress, scrollTo])

  useEffect(() => {
    const loreElems = Array.from(document.getElementsByClassName('loreHighlight'))
    for (const elem of loreElems) {
      elem.addEventListener('click', onLoreClick)
    }
    return () => {
      for (const elem of loreElems) {
        elem.removeEventListener('click', onLoreClick)
      }
    }
  })

  const { chapterNo, title, date, volumeNo, html, tags, notes } = chapter

  const chapterNav = () => {
    if (!nextChapter && !prevChapter) {
      return null
    }
    return (
      <ContentBlock>
        <Row className={styles.bottomNav} horizontal="space-between">
          {prevChapter ? (
            <Link
              className={utilStyles.coloredLink}
              href={`/chapters/${prevChapter.id}`}>{`← ${prevChapter.title}`}</Link>
          ) : (
            <div />
          )}
          {nextChapter ? (
            <Link
              className={utilStyles.coloredLink}
              href={`/chapters/${nextChapter.id}`}>{`${nextChapter.title} →`}</Link>
          ) : (
            <div />
          )}
        </Row>
      </ContentBlock>
    )
  }

  const LorePopover = (lore: LoreData) => (
    <Column vertical="center" onClick={() => setLorePopover(undefined)} className={styles.lorePopoverBackground}>
      <ChapterLoreItem lore={lore} dismiss={() => setLorePopover(undefined)} />
    </Column>
  )

  return (
    <>
      <Header type="Primary" sticky>
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
      <Header type="Secondary">
        <Row horizontal="space-between" vertical="center">
          <div className={classes(utilStyles.lightText, utilStyles.smallText)}>
            {`Volume ${volumeNo}, Chapter ${chapterNo}`}
          </div>
          {date && (
            <div className={classes(utilStyles.lightText, utilStyles.smallText)}>
              <Date dateString={date} />
            </div>
          )}
        </Row>
      </Header>
      <ContentBlock>
        <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: html }} />
      </ContentBlock>
      {!!notes && (
        <>
          <Header type="Secondary" title="Author Notes" />
          <ContentBlock>
            <div
              id="chapter_content"
              style={{ padding: 5 }}
              className={postStyles.post}
              dangerouslySetInnerHTML={{ __html: notes }}
            />
          </ContentBlock>
        </>
      )}
      {chapterNav()}
      {lorePopover && LorePopover(lorePopover.lore)}
    </>
  )
}
export default Chapter
