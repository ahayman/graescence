import { FunctionComponent, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useStateDebouncer } from '../../hooks/useStateDebouncer'
import { classes, userCanAccessTier } from '../../lib/utils'
import { DisplayContext } from '../../providers/Display/Provider'
import { OptionsContext } from '../../providers/Options/Provider'
import { PatreonContext } from '../../providers/Patreon/Provider'
import { AccessNeeded } from '../Patreon/AccessNeeded'
import { ReadingOptions as ProviderReadingOptions } from '../../providers/Options/Types'
import { ProgressContext } from '../../providers/Progress/Provider'
import { AccessTier } from '../../app/api/types'
import { ContentType } from '../../staticGenerator/types'
import Row from '../Row'
import Link from 'next/link'
import { ScrollIndicator } from '../ScrollIndicator/ScrollIndicator'

import utilStyles from '../../styles/utils.module.scss'
import postStyles from '../../styles/post.module.scss'
import styles from './Reader.module.scss'

export type NavLink = {
  title: string
} & ({ url: string } | { onClick: () => void })

type Props = {
  html: string
  type: ContentType
  tier: AccessTier
  uuid: string
  isPublic: boolean
  nav: {
    prev?: NavLink
    next?: NavLink
  }
}

type BoundingSize = { width: number; height: number }

type LayoutMetrics = {
  contentSize: BoundingSize
  readingOptions: ProviderReadingOptions
  fullScreen: boolean
}

export const Reader: FunctionComponent<Props> = ({ html, type, tier, uuid, isPublic, nav }) => {
  const {
    state: { readingOptions },
  } = useContext(OptionsContext)
  const {
    state: { fullScreen, popover },
  } = useContext(DisplayContext)
  const [layoutMetrics, _, setLayoutMetrics] = useStateDebouncer<LayoutMetrics>(
    { contentSize: { width: 0, height: 0 }, fullScreen, readingOptions },
    500,
  )
  const {
    state: { progress },
    actions: { updateProgress },
  } = useContext(ProgressContext)
  const [currentProgress, latestCurrentProgress, setCurrentProgress] = useStateDebouncer(
    progress[uuid]?.progress ?? 0,
    300,
  )
  const user = useContext(PatreonContext).state.user
  const pagedMeasureRef = useRef<HTMLDivElement>(null)
  const pagedContentRef = useRef<HTMLDivElement>(null)
  const scrolledContentRef = useRef<HTMLDivElement>(null)
  const hasAccess = isPublic || userCanAccessTier(user, tier)
  const progressRef = useRef(latestCurrentProgress)
  progressRef.current = latestCurrentProgress
  const [pageCount, setPageCount] = useState(0)

  const scrollTo = useCallback((progress: number) => {
    const scrollable = scrolledContentRef.current
    if (scrollable === null) return
    const height = scrollable.scrollHeight
    const top = height * progress + scrollable.clientHeight
    scrollable.scrollTo({ top })
  }, [])

  const scrollToIndex = (idx: number, behavior: ScrollBehavior = 'smooth') => {
    const scrollable = pagedContentRef.current
    const pageWidth = scrollable?.children[0]?.getBoundingClientRect().width
    if (!pageWidth) return
    const left = pageWidth * idx
    scrollable.scrollTo({ left, behavior })
  }

  const setScrollProgress = useCallback(() => {
    const scrollable = scrolledContentRef.current
    if (!scrollable || !scrollable.textContent) return
    const height = scrollable.scrollHeight
    const offset = scrollable.scrollTop - scrollable.clientHeight
    if (height <= 0) return
    const progress = offset / height
    setCurrentProgress(progress)
  }, [setCurrentProgress])

  const setPagedScrollProgress = useCallback(() => {
    const scrollable = pagedContentRef.current
    if (!scrollable || !scrollable.textContent) return
    const width = scrollable.scrollWidth - scrollable.clientWidth
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

  useEffect(
    function updateProgressOnChange() {
      updateProgress(uuid, type, currentProgress)
    },
    [currentProgress, type, updateProgress, uuid],
  )

  useEffect(
    function updateVerticalScrollOnLayout() {
      if (readingOptions.pageLayout !== 'verticalScroll') return
      scrollTo(progressRef.current)
    },
    [uuid, readingOptions.pageLayout, scrollTo],
  )

  useEffect(
    function setInitialProgressUpdate() {
      updateProgress(uuid, 'chapter')
    },
    [updateProgress, uuid],
  )

  useEffect(
    function setupScrollListeners() {
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
    },
    [onScroll, onResize, readingOptions.pageLayout, updateProgress],
  )

  useEffect(
    function updateLayoutMetrics() {
      if (popover && readingOptions.pageLayout === 'paged') return // Don't update when a popover is displayed to prevent the layout from locking us out
      const scrollable = pagedMeasureRef.current ?? scrolledContentRef.current
      if (!scrollable) return
      const rect = scrollable.getBoundingClientRect()
      const contentSize: BoundingSize = { width: rect.width, height: rect.height }
      setLayoutMetrics({ contentSize, readingOptions, fullScreen })
    },
    [readingOptions, fullScreen, popover, setLayoutMetrics],
  )

  useEffect(
    function calculatePagedContent() {
      const calculatePages = async () => {
        const { readingOptions, contentSize } = layoutMetrics
        if (readingOptions.pageLayout !== 'paged') return
        const chapterMeasure = pagedMeasureRef.current
        const pagedContent = pagedContentRef.current
        if (
          !html ||
          !chapterMeasure ||
          !pagedContent ||
          contentSize.height <= 0 ||
          contentSize.width <= 0 ||
          !hasAccess
        )
          return

        const pages: HTMLDivElement[] = []
        let carryOverTags: Tag[] = []
        let currentPageText = ''
        pagedContent.textContent = ''

        const createPage = (size: BoundingSize, idx: number) => {
          const page = document.createElement('div') // creates new html element
          page.setAttribute('class', classes(styles.contentPage, postStyles.post)) // appends the class "page" to the element
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
    },
    [html, layoutMetrics, hasAccess],
  )

  return (
    <>
      <div onResize={onResize} className={classes(styles.contentContainer)}>
        {hasAccess ? (
          <>
            <div
              ref={pagedMeasureRef}
              onResize={onResize}
              id="ChapterMeasure"
              className={classes(postStyles.post, styles.contentMeasure)}
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
          </>
        ) : (
          <AccessNeeded content={html} tier="story" isAlreadyLinked={user !== undefined} />
        )}
      </div>
      <Row className={styles.bottomNav} horizontal="space-between" vertical="center">
        <Link
          style={{ textAlign: 'left' }}
          onClick={nav.prev && 'onClick' in nav.prev ? nav.prev.onClick : undefined}
          className={classes(
            utilStyles.coloredLink,
            styles.bottomNavItem,
            nav.prev ? styles.contentVisible : styles.contentHidden,
          )}
          href={nav.prev && 'url' in nav.prev ? nav.prev.url : ''}>{` ← ${nav.prev?.title}`}</Link>
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
          onClick={nav.next && 'onClick' in nav.next ? nav.next.onClick : undefined}
          className={classes(
            utilStyles.coloredLink,
            styles.bottomNavItem,
            nav.next ? styles.contentVisible : styles.contentHidden,
          )}
          href={nav.next && 'url' in nav.next ? nav.next.url : ''}>{`${nav.next?.title} → `}</Link>
      </Row>
    </>
  )
}

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
