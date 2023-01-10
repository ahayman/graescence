'use client'
import utilStyles from '../styles/utils.module.scss'
import Date from '../components/date'
import Link from 'next/link'
import { classes } from '../lib/utils'
import { useContext } from 'react'
import { ContentContext } from '../providers/Content/Provider'
import ContentBlock from '../components/ContentBlock/ContentBlock'
import Header from '../components/Header/Header'
import Column from '../components/Column'

const Home = () => {
  const { chapters, updates } = useContext(ContentContext)
  const latestChapter = chapters.items[chapters.items.length - 1]
  const latestPost = updates[updates.length - 1]
  return (
    <>
      <Header type="Primary">
        <Column horizontal="center">
          <h3>Graescence</h3>
          <span className={utilStyles.smallText}>a web novel</span>
        </Column>
      </Header>
      <ContentBlock
        className={utilStyles.smallText}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10 }}>
        <p>Initial Next site that may or may not be destined to become my web novel blog.</p>
      </ContentBlock>
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
            {latestPost.excerpt && <div dangerouslySetInnerHTML={{ __html: latestPost.excerpt }} />}
          </ContentBlock>
        </Column>
      )}
    </>
  )
}
export default Home
