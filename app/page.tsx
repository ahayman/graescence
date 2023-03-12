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

const Home = () => {
  const { chapters, updates, home } = useContext(ContentContext)
  const {
    state: { currentChapterId },
  } = useContext(ProgressContext)
  const latestChapter = chapters.items[chapters.items.length - 1]
  const latestPost = updates[updates.length - 1]
  const currentChapter = currentChapterId ? chapters.items[chapters.byID[currentChapterId]] : undefined

  return (
    <>
      <Header type="Primary">
        <Column horizontal="center">
          <h3>Graescence</h3>
          <span className={utilStyles.smallText}>a web novel</span>
        </Column>
      </Header>
      <ContentBlock>
        <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: home }} />
      </ContentBlock>
      {currentChapter && (
        <Column>
          <Header type="Secondary" title="Continue Reading" />
          <ContentBlock>
            <Link href={`/chapters/${currentChapter.id}`}>
              <h4>{currentChapter.title}</h4>
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
        <Column>
          <Header type="Secondary" title="Latest Chapter" />
          <ContentBlock>
            <Link href={`/chapters/${latestChapter.id}`}>
              <h4>{latestChapter.title}</h4>
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
        <Column>
          <Header type="Secondary" title="Latest Update" />
          <ContentBlock>
            <Link href={`/updates/${latestPost.id}`}>
              <h4>{latestPost.title}</h4>
              <div className={[utilStyles.lightText, utilStyles.smallText].join(' ')}>
                <Date dateString={latestPost.date} />
              </div>
            </Link>
            {latestPost.excerpt && (
              <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: latestPost.excerpt }} />
            )}
          </ContentBlock>
        </Column>
      )}
    </>
  )
}
export default Home
