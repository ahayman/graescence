import './globals.scss'
import {} from '../lib/array'
import Head from 'next/head'
import { ReactNode } from 'react'
import styles from './layout.module.scss'
import Nav from '../components/Nav/nav'
import Providers from './providers'
import { getSortedContentData, getContent, PostMeta, ChapterMeta, LoreMeta } from '../api/contentData'
import Content from '../components/Content/Content'

export type Props = {
  children?: ReactNode
}

const siteTitle = 'Graescence, a web novel'

const Layout = async ({ children }: Props) => {
  /**
   * Note: It's very important to map the data here.
   * Otherwise, the entire dataset will be loaded into each page (since this is a layout)
   * which will bloat the website. We _only_ want metatdata here.
   */
  const updates: PostMeta[] = (await getSortedContentData('updates')).map(({ id, title, date, excerpt }) => ({
    id,
    title,
    date,
    excerpt,
  }))
  const chapters: ChapterMeta[] = (await getSortedContentData('chapters')).map(
    ({ id, title, date, volumeNo, volumeName, chapterNo, tags }) => ({
      id,
      title,
      date,
      volumeNo,
      volumeName,
      chapterNo,
      tags,
    }),
  )
  const lore: LoreMeta[] = (await getSortedContentData('lore')).map(({ id, title, date, tags, category }) => ({
    id,
    title,
    date,
    tags,
    category,
  }))
  const home = await getContent('home')
  return (
    <html>
      <Head>
        <title>{siteTitle}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="og:title" content={siteTitle} />
      </Head>
      <body>
        <div className={styles.container}>
          <Providers content={{ updates, chapters, lore, home }}>
            <div className={styles.split}>
              <div className={styles.nav}>
                <Nav />
              </div>
              <Content>{children}</Content>
            </div>
          </Providers>
        </div>
      </body>
    </html>
  )
}

export default Layout
