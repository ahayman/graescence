import './globals.scss'
import Head from 'next/head'
import { ReactNode } from 'react'
import styles from './layout.module.scss'
import Nav from '../components/Nav/nav'
import Providers from './providers'
import { getSortedContentData } from '../api/contentData'
import Content from '../components/Content/Content'

export type Props = {
  children?: ReactNode
}

const siteTitle = 'Graescence, a web novel'

const Layout = async ({ children }: Props) => {
  const updates = await getSortedContentData('updates')
  const chapters = await getSortedContentData('chapters')
  const lore = await getSortedContentData('lore')
  return (
    <html>
      <Head>
        <title>{siteTitle}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="og:title" content={siteTitle} />
      </Head>
      <body>
        <div className={styles.container}>
          <Providers content={{ updates, chapters, lore }}>
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
