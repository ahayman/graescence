import './globals.scss'
import Head from 'next/head'
import { ReactNode } from 'react'
import styles from './layout.module.scss'
import Nav from '../components/nav'
import { getSortedChapterData } from '../api/chapters'
import { getSortedPostsData } from '../api/posts'
import Providers from './providers'

export type Props = {
  children?: ReactNode
}

const siteTitle = 'Graescence, a web novel'

const Layout = async ({ children }: Props) => {
  const posts = await getSortedPostsData()
  const chapters = await getSortedChapterData()
  return (
    <html>
      <Head>
        <title>{siteTitle}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="og:title" content={siteTitle} />
      </Head>
      <body>
        <div className={styles.container}>
          <Providers content={{ posts, chapters }}>
            <div className={styles.split}>
              <div className={styles.nav}>
                <Nav />
              </div>
              <div className={styles.mainContainer}>
                <div className={styles.main}>
                  <main>{children}</main>
                </div>
              </div>
            </div>
          </Providers>
        </div>
      </body>
    </html>
  )
}

export default Layout
