'use client'
import Date from '../../../components/date'
import utilStyles from '../../../styles/utils.module.scss'
import postStyles from '../../../styles/post.module.scss'
import styles from './chapter.module.css'
import ReadingOptions from '../../../components/ReadingOptions/ReadingOptions'
import Row from '../../../components/Row'
import Column from '../../../components/Column'
import { useContext } from 'react'
import { ContentContext } from '../../../contexts/Content/Provider'

export type Props = {
  id: string
}

const Chapter = ({ id }: Props) => {
  const { chapters } = useContext(ContentContext)
  const chapter = chapters.find(c => c.id === id)
  if (!chapter) {
    return <div> No Chapter Found!</div>
  }
  const { chapterNo, title, date, volumeNo, html, tags } = chapter
  return (
    <>
      <div className={styles.readOptions}>
        <ReadingOptions />
      </div>
      <Row horizontal="space-between" vertical="center">
        <Column>
          {tags.length > 0 && (
            <h1 className={[utilStyles.headingMd, utilStyles.lightText].join(' ')}>{tags.join(', ')}</h1>
          )}
        </Column>
        <h1 className={utilStyles.headingLg}>{title}</h1>
        <Column>
          {date && (
            <div className={utilStyles.lightText}>
              <Date dateString={date} />
            </div>
          )}
          <div className={[utilStyles.lightText, utilStyles.smallText].join(' ')}>
            {`Volume ${volumeNo}, Chapter ${chapterNo}`}
          </div>
        </Column>
      </Row>
      <br />
      <br />
      <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: html }} />
    </>
  )
}
export default Chapter
