'use client'
import Date from '../../../components/date'
import utilStyles from '../../../styles/utils.module.scss'
import postStyles from '../../../styles/post.module.scss'
import styles from './chapter.module.scss'
import ReadingOptions from '../../../components/ReadingOptions/ReadingOptions'
import Row from '../../../components/Row'
import { PointerEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
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
import { useStateDebouncer } from '../../../lib/useStateDebouncert'
import { ScrollIndicator } from '../../../components/ScrollIndicator/ScrollIndicator'

export type Props = {
  id: string
  chapter: ChapterData
}

type LorePopoverState = {
  lore: LoreData
  position: { x: number; y: number }
}

type BoundingSize = { width: number; height: number }

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
  const [contentSize, _, setContentSize] = useStateDebouncer<BoundingSize>({ width: 0, height: 0 }, 500)
  const [currentProgress, latestCurrentProgress, setCurrentProgress] = useStateDebouncer(0, 500)
  const [lorePopover, setLorePopover] = useState<LorePopoverState>()
  const [pageCount, setPageCount] = useState(0)
  const { chapters } = useContext(ContentContext)
  const pagedMeasureRef = useRef<HTMLDivElement>(null)
  const pagedContentRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const autoScroll = useRef(true)
  const {
    state: { chapterProgress },
    actions: { updateCurrentChapter },
  } = useContext(ProgressContext)
  const chapterIdx = useMemo(() => chapters.findIndex(c => c.id === id), [chapters, id])
  const nextChapter = chapters[chapterIdx + 1]
  const prevChapter = chapters[chapterIdx - 1]

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
    setCurrentProgress(progress)
  }, [setCurrentProgress])

  const setPagedScrollProgress = useCallback(() => {
    const scrollable = pagedContentRef.current
    if (scrollable === null) return
    const height = scrollable.scrollWidth
    const offset = scrollable.scrollLeft
    if (height <= 0) return
    const progress = offset / height
    setCurrentProgress(progress)
  }, [setCurrentProgress])

  const onScroll = useCallback(() => {
    setPagedScrollProgress()
  }, [setPagedScrollProgress])

  useEffect(() => {
    updateCurrentChapter(chapter.id, currentProgress)
  }, [chapter.id, currentProgress, updateCurrentChapter])

  useEffect(() => {
    const chapterMeasure = pagedMeasureRef.current
    if (chapterMeasure) {
      const rect = chapterMeasure.getBoundingClientRect()
      setContentSize({ height: rect.height, width: rect.width })
    }
  }, [setContentSize])

  const onResize = useCallback(() => {
    const pagedContent = pagedContentRef.current
    if (pagedContent) pagedContentRef.current.textContent = ''

    const chapterMeasure = pagedMeasureRef.current
    if (chapterMeasure) {
      const rect = chapterMeasure.getBoundingClientRect()
      setContentSize({ height: rect.height, width: rect.width })
    }
    const progress = chapterProgress[chapter.id]
    if (progress !== undefined) {
      scrollTo(progress)
    }
  }, [chapterProgress, chapter.id, setContentSize, scrollTo])

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

  const onIndicatorClick = (idx: number) => {
    console.log(`Scroll to index: ${idx}`)
    const scrollable = pagedContentRef.current
    if (!scrollable) return
    const pageWidth = scrollable.children[0].getBoundingClientRect().width
    const left = pageWidth * idx
    scrollable.scrollTo({ left, behavior: 'smooth' })
  }

  useEffect(() => {
    updateCurrentChapter(chapter.id)
    // const scrollable = document.getElementById('main-content-container')
    const scrollable = pagedContentRef.current
    scrollable?.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      scrollable?.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [chapter, onScroll, onResize, updateCurrentChapter])

  useEffect(() => {
    const pages: HTMLDivElement[] = []
    const text = chapter.html
    const chapterMeasure = pagedMeasureRef.current
    const pagedContent = pagedContentRef.current
    if (!text || !chapterMeasure || !pagedContent || contentSize.height <= 0 || contentSize.width <= 0) return

    const createPage = (size: BoundingSize, idx: number) => {
      const page = document.createElement('div') // creates new html element
      page.setAttribute('class', styles.chapterPage) // appends the class "page" to the element
      page.setAttribute('id', `chapter-page-${idx}`)
      page.setAttribute(
        'style',
        `min-height: ${size.height}, max-height: ${size.height}px; min-width: ${size.width}px; max-width: ${size.width}px; padding: 5pt`,
      )
      pages.push(page)
      return page
    }

    const appendToPage = (page: HTMLDivElement, word: string, height: number) => {
      const pageText = page.innerHTML // gets the text from the last page
      const pageElems = page.children

      if (word.startsWith('<p>') || pageElems.length === 0) {
        page.innerHTML += word + ' ' // saves the text of the last page
      } else {
        if (word.endsWith('</p>')) word = word.slice(0, -4)
        const lastElem = pageElems[pageElems.length - 1]
        lastElem.innerHTML += word + ' '
      }
      if (page.offsetHeight >= height) {
        // checks if the page overflows (more words than space)
        page.innerHTML = pageText //resets the page-text
        return false // returns false because page is full
      } else {
        return true // returns true because word was successfully filled in the page
      }
    }

    pagedContent.textContent = ''
    const textArray = text.split(/(?<=>[^<>]*?)\s(?=[^<>]*?<)/) // Split the text into words without

    let idx = 0
    let page = createPage(contentSize, idx++) // creates the first page
    chapterMeasure.appendChild(page) // appends the element to the container for all the pages

    for (var i = 0; i < textArray.length; i++) {
      // loops through all the words
      const success = appendToPage(page, textArray[i], contentSize.height) // tries to fill the word in the last page
      if (!success) {
        // checks if word could not be filled in last page
        chapterMeasure.removeChild(page)
        page = createPage(contentSize, idx++) // create new empty page
        chapterMeasure.appendChild(page) // appends the element to the container for all the pages
        appendToPage(page, textArray[i], contentSize.height) // fill the word in the new last element
      }
    }
    chapterMeasure.removeChild(page)

    setPageCount(pages.length)
    pages.forEach(page => pagedContent.appendChild(page))
  }, [chapter.html, contentSize])

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
    return (
      <ContentBlock>
        <Row className={styles.bottomNav} horizontal="space-between" vertical="center">
          {prevChapter ? (
            <Link
              style={{ textAlign: 'left' }}
              className={classes(utilStyles.coloredLink, styles.bottomNavItem)}
              href={`/chapters/${prevChapter.id}`}>{`← ${prevChapter.title}`}</Link>
          ) : (
            <div className={styles.bottomNavItem} />
          )}
          <ScrollIndicator
            className={styles.bottomNavIndicator}
            pageCount={pageCount}
            progress={latestCurrentProgress}
            onClick={onIndicatorClick}
          />
          {nextChapter ? (
            <Link
              style={{ textAlign: 'right' }}
              className={classes(utilStyles.coloredLink, styles.bottomNavItem)}
              href={`/chapters/${nextChapter.id}`}>{`${nextChapter.title} →`}</Link>
          ) : (
            <div className={styles.bottomNavItem} />
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
    <div className={styles.main}>
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
      <div className={styles.chapterContainer}>
        <div ref={pagedMeasureRef} id="ChapterMeasure" className={classes(postStyles.post, styles.chapterMeasure)} />
        <div
          style={{ ...contentSize }}
          ref={pagedContentRef}
          id="PagedContent"
          className={classes(postStyles.post, styles.pagedContent)}
          // dangerouslySetInnerHTML={{ __html: html }}
        ></div>
      </div>
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
    </div>
  )
}
export default Chapter
