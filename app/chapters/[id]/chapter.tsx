'use client'
import Date from '../../../components/date'
import utilStyles from '../../../styles/utils.module.scss'
import postStyles from '../../../styles/post.module.scss'
import styles from './chapter.module.css'
import ReadingOptions from '../../../components/ReadingOptions/ReadingOptions'
import Row from '../../../components/Row'
import Column from '../../../components/Column'
import { useContext, useEffect } from 'react'
import { ContentContext } from '../../../providers/Content/Provider'
import ContentBlock from '../../../components/ContentBlock/ContentBlock'
import Header from '../../../components/Header/Header'
import Tags from '../../../components/Tags/Tags'
import { classes } from '../../../lib/utils'
import Link from 'next/link'
import { ProgressContext } from '../../../providers/Progress/Provider'
import { DisplayContext } from '../../../providers/Display/Provider'

export type Props = {
  id: string
}

const Chapter = ({ id }: Props) => {
  const { chapters } = useContext(ContentContext)
  const {
    actions: { setOptions, clearOptions },
  } = useContext(DisplayContext)
  const {
    actions: { updateCurrentChapter },
  } = useContext(ProgressContext)
  const chapterIdx = chapters.byID[id]
  const chapter = chapters.items[chapterIdx]
  const nextChapter = chapters.items[chapterIdx + 1]
  const prevChapter = chapters.items[chapterIdx - 1]

  useEffect(() => {
    if (chapter) {
      updateCurrentChapter(chapter.id)
    }
  }, [chapter, updateCurrentChapter])

  useEffect(() => {
    setOptions(<ReadingOptions />)
    return () => {
      clearOptions()
    }
  }, [setOptions, clearOptions])

  if (!chapter) {
    return <div> No Chapter Found!</div>
  }
  const { chapterNo, title, date, volumeNo, html, tags } = chapter

  const chapterNav = () => {
    if (!nextChapter && !prevChapter) {
      return null
    }
    return (
      <Row className={styles.bottomNav} horizontal="space-between">
        {prevChapter ? (
          <Link className={utilStyles.coloredLink} href={`chapters/${prevChapter.id}`}>{`← ${prevChapter.title}`}</Link>
        ) : (
          <div />
        )}
        {nextChapter ? (
          <Link className={utilStyles.coloredLink} href={`chapters/${nextChapter.id}`}>{`${nextChapter.title} →`}</Link>
        ) : (
          <div />
        )}
      </Row>
    )
  }

  return (
    <>
      <Header type="Primary">
        <Row horizontal="space-between" vertical="center">
          {title}
          <ReadingOptions />
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
        <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: html }} />
        <br />
        {chapterNav()}
      </ContentBlock>
    </>
  )
}
export default Chapter
