'use client'
import utilStyles from '../styles/utils.module.scss'
import Date from '../components/date'
import Link from 'next/link'
import { classes } from '../lib/utils'
import { useContext } from 'react'
import { ContentContext } from '../contexts/Content/Provider'

const Home = () => {
  const content = useContext(ContentContext)
  const latestChapter = content?.chapters[content?.chapters.length - 1]
  const latestPost = content?.posts[content?.posts.length - 1]
  return (
    <>
      <section
        className={utilStyles.smallText}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10 }}>
        <p>Initial Next site that may or may not be destined to become my web novel blog.</p>
        <hr className={classes(utilStyles.indentedHR, utilStyles.lightHR)} />
      </section>
      {latestChapter && (
        <section className={`${utilStyles.headingMid} ${utilStyles.padding1px}`}>
          <h2 className={utilStyles.headingLg}>Latest Chapter</h2>
          <div className={utilStyles.listItem}>
            <hr />
            <Link href={`/chapters/${latestChapter.id}`}>
              <h4>{latestChapter.title}</h4>
              <br />
              {latestChapter.date && (
                <div className={classes(utilStyles.lightText, utilStyles.smallText)}>
                  <Date dateString={latestChapter.date} />
                </div>
              )}
            </Link>
          </div>
        </section>
      )}
      {latestPost && (
        <section className={`${utilStyles.headingMid} ${utilStyles.padding1px}`}>
          <h2 className={utilStyles.headingLg}>Latest Update</h2>
          <div className={utilStyles.listItem}>
            <hr />
            <Link href={`/posts/${latestPost.id}`}>
              <h4>{latestPost.title}</h4>
              <div className={[utilStyles.lightText, utilStyles.smallText].join(' ')}>
                <Date dateString={latestPost.date} />
              </div>
            </Link>
            {latestPost.excerpt && <div dangerouslySetInnerHTML={{ __html: latestPost.excerpt }} />}
          </div>
        </section>
      )}
    </>
  )
}
export default Home
