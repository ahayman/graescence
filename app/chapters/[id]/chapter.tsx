'use client'
import Date from '../../../components/date'
import utilStyles from '../../../styles/utils.module.scss'
import postStyles from '../../../styles/post.module.scss'
import styles from './chapter.module.scss'
import ReadingOptions from '../../../components/ReadingOptions/ReadingOptions'
import Row from '../../../components/Row'
import Column from '../../../components/Column'
import { useContext, useEffect, useState } from 'react'
import { ContentContext } from '../../../providers/Content/Provider'
import ContentBlock from '../../../components/ContentBlock/ContentBlock'
import Header from '../../../components/Header/Header'
import Tags from '../../../components/Tags/Tags'
import { classes } from '../../../lib/utils'
import Link from 'next/link'
import { ProgressContext } from '../../../providers/Progress/Provider'
import { faNoteSticky, faListSquares } from '@fortawesome/free-solid-svg-icons'
import Popover from '../../../components/Popover/Popover'
import { useChapterLore } from './hooks/useChapterLore'
import ChapterLore from './chapterLore'
import { DisplayContext } from '../../../providers/Display/Provider'

export type Props = {
  id: string
}

const Chapter = ({ id }: Props) => {
  const {
    state: { popover },
  } = useContext(DisplayContext)
  const highlightLore = popover?.name === 'ChapterLore'
  const { chapters, lore } = useContext(ContentContext)
  const {
    actions: { updateCurrentChapter },
  } = useContext(ProgressContext)
  const chapterIdx = chapters.byID[id]
  const chapter = useChapterLore(chapters.items[chapterIdx], lore.items)
  const nextChapter = chapters.items[chapterIdx + 1]
  const prevChapter = chapters.items[chapterIdx - 1]

  useEffect(() => {
    if (chapter) {
      updateCurrentChapter(chapter.id)
    }
  }, [chapter, updateCurrentChapter])

  if (!chapter) {
    return <div> No Chapter Found!</div>
  }
  const { chapterNo, title, date, volumeNo, html, tags, notes, highlightedHtml } = chapter

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
              href={`chapters/${prevChapter.id}`}>{`??? ${prevChapter.title}`}</Link>
          ) : (
            <div />
          )}
          {nextChapter ? (
            <Link
              className={utilStyles.coloredLink}
              href={`chapters/${nextChapter.id}`}>{`${nextChapter.title} ???`}</Link>
          ) : (
            <div />
          )}
        </Row>
      </ContentBlock>
    )
  }

  return (
    <>
      <Header type="Primary" sticky>
        <Row horizontal="space-between" vertical="center">
          {`${chapterNo} | ${title}`}
          <Row>
            <ReadingOptions />
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
          <Tags tags={tags} />
          <Column>
            {date && (
              <div className={classes(utilStyles.lightText, utilStyles.smallText)}>
                <Date dateString={date} />
              </div>
            )}
            <div className={classes(utilStyles.lightText, utilStyles.smallText)}>
              {`Volume ${volumeNo}, Chapter ${chapterNo}`}
            </div>
          </Column>
        </Row>
      </Header>
      <ContentBlock>
        <div
          className={postStyles.post}
          dangerouslySetInnerHTML={{ __html: highlightLore ? highlightedHtml ?? html : html }}
        />
      </ContentBlock>
      {!!notes && (
        <>
          <Header type="Secondary" title="Author Notes" />
          <ContentBlock>
            <div style={{ padding: 5 }} className={postStyles.post} dangerouslySetInnerHTML={{ __html: notes }} />
          </ContentBlock>
        </>
      )}
      {chapterNav()}
    </>
  )
}
export default Chapter
