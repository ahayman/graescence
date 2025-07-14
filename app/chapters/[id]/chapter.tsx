'use client'
import utilStyles from '../../../styles/utils.module.scss'
import postStyles from '../../../styles/post.module.scss'
import styles from './chapter.module.scss'
import ReadingOptions from '../../../components/ReadingOptions/ReadingOptions'
import Row from '../../../components/Row'
import { PointerEvent, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ContentContext } from '../../../providers/Content/Provider'
import Header from '../../../components/Header/Header'
import Tags from '../../../components/Tags/Tags'
import { classes } from '../../../lib/utils'
import Link from 'next/link'
import { ProgressContext } from '../../../providers/Progress/Provider'
import { faNoteSticky, faListSquares, faSliders, faClose } from '@fortawesome/free-solid-svg-icons'
import Popover from '../../../components/Popover/Popover'
import ChapterLore from './chapterLore'
import { ChapterData, ChapterMeta, LoreData } from '../../../api/types'
import Column from '../../../components/Column'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useStateDebouncer } from '../../../lib/useStateDebouncer'
import { ScrollIndicator } from '../../../components/ScrollIndicator/ScrollIndicator'
import { OptionsContext } from '../../../providers/Options/Provider'
import { DisplayContext } from '../../../providers/Display/Provider'
import { ReadingOptions as ProviderReadingOptions } from '../../../providers/Options/Types'

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

type LayoutMetrics = {
  contentSize: BoundingSize
  readingOptions: ProviderReadingOptions
  fullScreen: boolean
}

const Chapter = ({ id, chapter }: Props) => {
  const { chapterNo, title, html, tags, notes } = chapter
  const {
    state: { readingOptions },
  } = useContext(OptionsContext)
  const {
    state: { fullScreen, popover },
  } = useContext(DisplayContext)
  const [layoutMetrics, latestLayoutMetrics, setLayoutMetrics] = useStateDebouncer<LayoutMetrics>(
    { contentSize: { width: 0, height: 0 }, fullScreen, readingOptions },
    500,
  )
  const [lorePopover, setLorePopover] = useState<LorePopoverState>()
  const [pageCount, setPageCount] = useState(0)
  const { chapters } = useContext(ContentContext)
  const pagedMeasureRef = useRef<HTMLDivElement>(null)
  const pagedContentRef = useRef<HTMLDivElement>(null)
  const scrolledContentRef = useRef<HTMLDivElement>(null)
  const {
    state: { chapterProgress },
    actions: { updateCurrentChapter },
  } = useContext(ProgressContext)
  const [currentProgress, latestCurrentProgress, setCurrentProgress] = useStateDebouncer(
    chapterProgress[chapter.id] ?? 0,
    300,
  )
  const progressRef = useRef(latestCurrentProgress)
  progressRef.current = latestCurrentProgress
  const chapterIdx = useMemo(() => chapters.findIndex(c => c.id === id), [chapters, id])
  const nextChapter: ChapterMeta | undefined = chapters[chapterIdx + 1]
  const prevChapter: ChapterMeta | undefined = chapters[chapterIdx - 1]

  const scrollTo = useCallback((progress: number) => {
    const scrollable = scrolledContentRef.current
    if (scrollable === null) return
    const height = scrollable.scrollHeight
    const top = height * progress
    scrollable.scrollTo({ top })
  }, [])

  const setScrollProgress = useCallback(() => {
    const scrollable = scrolledContentRef.current
    if (!scrollable || !scrollable.textContent) return
    const height = scrollable.scrollHeight
    const offset = scrollable.scrollTop
    if (height <= 0) return
    const progress = offset / height
    setCurrentProgress(progress)
  }, [setCurrentProgress])

  const setPagedScrollProgress = useCallback(() => {
    const scrollable = pagedContentRef.current
    if (!scrollable || !scrollable.textContent) return
    const width = scrollable.scrollWidth
    const offset = scrollable.scrollLeft
    if (width <= 0) return
    const progress = offset / width
    setCurrentProgress(progress)
  }, [setCurrentProgress])

  const onScroll = useCallback(() => {
    if (readingOptions.pageLayout === 'paged') setPagedScrollProgress()
    else if (readingOptions.pageLayout === 'verticalScroll') setScrollProgress()
  }, [readingOptions.pageLayout, setPagedScrollProgress, setScrollProgress])

  const onResize = useCallback(() => {
    const scrollable = pagedMeasureRef.current ?? scrolledContentRef.current
    if (!scrollable) return
    const rect = scrollable.getBoundingClientRect()
    const contentSize: BoundingSize = { width: rect.width, height: rect.height }
    setLayoutMetrics(m => ({ ...m, contentSize }))
  }, [setLayoutMetrics])

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

  const scrollToIndex = (idx: number, behavior: ScrollBehavior = 'smooth') => {
    const scrollable = pagedContentRef.current
    const pageWidth = scrollable?.children[0]?.getBoundingClientRect().width
    if (!pageWidth) return
    const left = pageWidth * idx
    scrollable.scrollTo({ left, behavior })
  }

  useEffect(() => {
    updateCurrentChapter(chapter.id, currentProgress)
  }, [chapter.id, currentProgress, updateCurrentChapter])

  useEffect(() => {
    if (popover && readingOptions.pageLayout === 'paged') return // Don't update when a popover is displayed to prevent the layout from locking us out
    const scrollable = pagedMeasureRef.current ?? scrolledContentRef.current
    if (!scrollable) return
    const rect = scrollable.getBoundingClientRect()
    const contentSize: BoundingSize = { width: rect.width, height: rect.height }
    setLayoutMetrics({ contentSize, readingOptions, fullScreen })
  }, [readingOptions, fullScreen, popover, setLayoutMetrics])

  useEffect(() => {
    if (latestLayoutMetrics.readingOptions.pageLayout === 'verticalScroll') scrollTo(progressRef.current)
  }, [latestLayoutMetrics, scrollTo])

  useEffect(() => {
    if (readingOptions.pageLayout !== 'verticalScroll') return
    scrollTo(progressRef.current)
  }, [chapter.id, readingOptions.pageLayout, scrollTo])

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

  useEffect(() => {
    updateCurrentChapter(chapter.id)
    const scrollable = readingOptions.pageLayout === 'paged' ? pagedContentRef.current : scrolledContentRef.current
    scrollable?.addEventListener('scroll', onScroll, { passive: true })

    const main = document.getElementById('chapter-main')
    const observer = main ? new ResizeObserver(onResize) : undefined
    if (main) observer?.observe(main)
    window.addEventListener('resize', onResize, { passive: true })
    return () => {
      scrollable?.removeEventListener('scroll', onScroll)
      if (main) observer?.unobserve(main)
      observer?.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [chapter, onScroll, onResize, updateCurrentChapter, readingOptions.pageLayout])

  useEffect(() => {
    const calculatePages = async () => {
      const { readingOptions, contentSize } = layoutMetrics
      if (readingOptions.pageLayout !== 'paged') return
      const chapterMeasure = pagedMeasureRef.current
      const pagedContent = pagedContentRef.current
      if (!html || !chapterMeasure || !pagedContent || contentSize.height <= 0 || contentSize.width <= 0) return

      const pages: HTMLDivElement[] = []
      let carryOverTags: Tag[] = []
      let currentPageText = ''
      pagedContent.textContent = ''

      const createPage = (size: BoundingSize, idx: number) => {
        const page = document.createElement('div') // creates new html element
        page.setAttribute('class', classes(styles.chapterPage, postStyles.post)) // appends the class "page" to the element
        page.setAttribute('id', `chapter-page-${idx}`)
        page.setAttribute(
          'style',
          `min-height: ${size.height}, max-height: ${size.height}px; min-width: ${size.width}px; max-width: ${size.width}px; padding: 5pt 5pt 0pt 5pt;`,
        )
        // Prepend carry over tags and reset them.
        // Carried over <p> tags must not have an indent since they're intended to separate pages and not paragraphs.
        currentPageText = carryOverTags
          .map(t => (t.tagName === 'p' ? "<p style='text-indent: 0pt !important;'>" : t.fullTag))
          .join()
        page.textContent = currentPageText
        carryOverTags = []
        pages.push(page)
        return page
      }

      const appendToPage = (page: HTMLDivElement, word: string, height: number) => {
        const pageText = currentPageText

        currentPageText = pageText + word + ' '
        page.innerHTML = currentPageText

        if (page.offsetHeight >= height) {
          // checks if the page overflows (more words than space)
          carryOverTags = carryOverTagsIn(pageText)
          //resets the page-text and appends closing carryover tags. Don't close <p> tags as they auto close
          page.innerHTML =
            pageText +
            carryOverTags
              .filter(t => t.tagName !== 'p')
              .map(t => `</${t.tagName}>`)
              .join()
          currentPageText = pageText
          return false // returns false because page is full
        } else {
          return true // returns true because word was successfully filled in the page
        }
      }

      const textArray = html.split(/(?<=>[^<>]*?)\s(?=[^<>]*?<)/) // Split the text into words without

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
      // Set the scroll to the correct progress offset
      const pageIdx = Math.floor(pages.length * progressRef.current)
      pagedContent.scrollTo({ left: pageIdx * contentSize.width })
    }
    calculatePages()
  }, [html, layoutMetrics])

  const chapterNav = () => {
    return (
      <Row className={styles.bottomNav} horizontal="space-between" vertical="center">
        <Link
          style={{ textAlign: 'left' }}
          className={classes(
            utilStyles.coloredLink,
            styles.bottomNavItem,
            prevChapter ? styles.contentVisible : styles.contentHidden,
          )}
          href={`/chapters/${prevChapter?.id}`}>{` ← Prev`}</Link>
        {readingOptions.pageLayout === 'paged' && (
          <ScrollIndicator
            className={classes(styles.bottomNavIndicator)}
            pageCount={pageCount}
            progress={latestCurrentProgress}
            onClick={scrollToIndex}
          />
        )}
        <Link
          style={{ textAlign: 'right' }}
          className={classes(
            utilStyles.coloredLink,
            styles.bottomNavItem,
            nextChapter ? styles.contentVisible : styles.contentHidden,
          )}
          href={`/chapters/${nextChapter?.id}`}>{`Next → `}</Link>
      </Row>
    )
  }

  const LorePopover = (lore: LoreData) => (
    <Column vertical="center" onClick={() => setLorePopover(undefined)} className={styles.lorePopoverBackground}>
      <ChapterLoreItem lore={lore} dismiss={() => setLorePopover(undefined)} />
    </Column>
  )

  return (
    <div id="chapter-main" onResize={onResize} className={styles.main}>
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
      <div onResize={onResize} className={classes(styles.chapterContainer)}>
        <div
          ref={pagedMeasureRef}
          onResize={onResize}
          id="ChapterMeasure"
          className={classes(postStyles.post, styles.chapterMeasure)}
        />
        <div
          ref={pagedContentRef}
          id="PagedContent"
          className={classes(
            postStyles.post,
            styles.pagedContent,
            readingOptions.pageLayout === 'paged' ? styles.contentVisible : styles.contentHidden,
          )}
        />
        <div
          ref={scrolledContentRef}
          id="ScrolledContent"
          className={classes(
            postStyles.post,
            styles.scrolledContent,
            readingOptions.pageLayout === 'verticalScroll' ? styles.contentVisible : styles.contentHidden,
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      {chapterNav()}
      {lorePopover && LorePopover(lorePopover.lore)}
    </div>
  )
}
export default Chapter

type Tag = {
  tagName: string
  fullTag: string
}
const selfClosingTags = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]
const carryOverTagsIn = (html: string): Tag[] => {
  const tags: Tag[] = []
  const matches = html.matchAll(/<(?:\/)?([a-z]+).*?>/g)
  for (const match of matches) {
    if (match[0].startsWith('</')) {
      const tagName = match[1]
      const lastIndex = tags.findLastIndex(t => t.tagName === tagName)
      if (lastIndex >= 0) tags.splice(lastIndex, 1)
    } else {
      const fullTag = match[0]
      const tagName = match[1]
      if (!selfClosingTags.includes(tagName) && !fullTag.endsWith('/>')) {
        tags.push({ fullTag, tagName })
      }
    }
  }
  return tags
}
