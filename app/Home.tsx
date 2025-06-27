'use client'
import utilStyles from '../styles/utils.module.scss'
import postStyles from '../styles/post.module.scss'
import Date from '../components/date'
import Link from 'next/link'
import { classes } from '../lib/utils'
import { useContext, useMemo } from 'react'
import { ContentContext } from '../providers/Content/Provider'
import ContentBlock from '../components/ContentBlock/ContentBlock'
import Header from '../components/Header/Header'
import Column from '../components/Column'
import { ProgressContext } from '../providers/Progress/Provider'
import Image from 'next/image'
import Row from '../components/Row'

export interface Props {
  content: string
}

const Home = ({ content }: Props) => {
  const { chapters, blog } = useContext(ContentContext)
  const {
    state: { currentChapterId },
  } = useContext(ProgressContext)
  const currentChapter = useMemo(
    () => chapters.find(c => c.id === currentChapterId) ?? chapters[0],
    [chapters, currentChapterId],
  )
  const latestChapter = chapters[chapters.length - 1]
  const latestPost = blog[blog.length - 1]

  const renderInfoBlock = (header: string, title: string, link: string, dateString?: string) => (
    <Column className={utilStyles.infoBlock}>
      <Header type="Secondary" title={header} />
      <Link className={utilStyles.infoData} href={link}>
        <Header type="Tertiary" title={title} />
        {dateString && (
          <div className={classes(utilStyles.lightText, utilStyles.smallText)}>
            <Date dateString={dateString} />
          </div>
        )}
      </Link>
    </Column>
  )

  return (
    <ContentBlock>
      <Row horizontal="center">
        <Image
          className={utilStyles.roundedCorners}
          src="/images/GraescenceBookCover-500.png"
          alt="Cover Artwork"
          layout="responsive"
          style={{ minWidth: 150, maxWidth: 400 }}
          width={400}
          height={533.2}
        />
      </Row>
      <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: content }} />
      <div className={utilStyles.infoContainer}>
        {currentChapter &&
          renderInfoBlock(
            'Continue Story',
            currentChapter.title,
            `/chapters/${currentChapter.id}`,
            currentChapter.date,
          )}
        {latestChapter &&
          renderInfoBlock('Latest Chapter', latestChapter.title, `/chapters/${latestChapter.id}`, latestChapter.date)}
        {latestPost && renderInfoBlock('Latest Post', latestPost.title, `/blog/${latestPost.id}`, latestPost.date)}
      </div>
    </ContentBlock>
  )
}
export default Home
