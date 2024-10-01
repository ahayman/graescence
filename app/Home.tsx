'use client'
import utilStyles from '../styles/utils.module.scss'
import postStyles from '../styles/post.module.scss'
import Date from '../components/date'
import Link from 'next/link'
import { classes } from '../lib/utils'
import { useContext } from 'react'
import { ContentContext } from '../providers/Content/Provider'
import ContentBlock from '../components/ContentBlock/ContentBlock'
import Header from '../components/Header/Header'
import Column from '../components/Column'
import { ProgressContext } from '../providers/Progress/Provider'

export interface Props {
  content: string
}

const Home = ({ content }: Props) => {
  const { chapters, updates } = useContext(ContentContext)
  const {
    state: { currentChapterId },
  } = useContext(ProgressContext)
  const latestChapter = chapters.items[chapters.items.length - 1]
  const latestPost = updates[updates.length - 1]
  const currentChapter = currentChapterId ? chapters.items[chapters.byID[currentChapterId]] : undefined

  return (
    <>
      <ContentBlock>
        <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: content }} />
      </ContentBlock>
      <div className={utilStyles.infoContainer}>
        {currentChapter && (
          <Column className={utilStyles.infoBlock}>
            <Header type="Secondary" title="Continue Reading" />
            <ContentBlock>
              <Link href={`/chapters/${currentChapter.id}`}>
                <Header type="Tertiary" title={currentChapter.title} />
                {currentChapter.date && (
                  <div className={classes(utilStyles.lightText, utilStyles.smallText)}>
                    <Date dateString={currentChapter.date} />
                  </div>
                )}
              </Link>
            </ContentBlock>
          </Column>
        )}
        {latestChapter && (
          <Column className={utilStyles.infoBlock}>
            <Header type="Secondary" title="Latest Chapter" />
            <ContentBlock>
              <Link href={`/chapters/${latestChapter.id}`}>
                <Header type="Tertiary" title={latestChapter.title} />
                {latestChapter.date && (
                  <div className={classes(utilStyles.lightText, utilStyles.smallText)}>
                    <Date dateString={latestChapter.date} />
                  </div>
                )}
              </Link>
            </ContentBlock>
          </Column>
        )}
        {latestPost && (
          <Column className={utilStyles.infoBlock}>
            <Header type="Secondary" title="Latest Update" />
            <ContentBlock>
              <Link href={`/updates/${latestPost.id}`}>
                <Header type="Tertiary" title={latestPost.title} />
                <div className={[utilStyles.lightText, utilStyles.smallText].join(' ')}>
                  <Date dateString={latestPost.date} />
                </div>
              </Link>
            </ContentBlock>
          </Column>
        )}
      </div>
    </>
  )
}
export default Home
