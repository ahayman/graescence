import './globals.scss'
import {} from '../lib/array'
import Head from 'next/head'
import { ReactNode } from 'react'
import styles from './layout.module.scss'
import Providers from './providers'
import { ChapterMeta, HistoryMeta, LoreMeta, Meta } from '../api/types'
import { getSortedContentData } from '../api/contentData'
import { MainLayout } from '../components/MainLayout/MainLayout'
import { Metadata } from 'next'

export type Props = {
  children?: ReactNode
}

const siteTitle = 'Graescence, a web novel'

export const metadata: Metadata = {
  title: siteTitle,
  viewport: {
    viewportFit: 'cover',
    width: 'device-width',
    initialScale: 1,
  },
  icons: [
    {
      url: '/images/icon-1024.png',
      type: 'image/png',
      sizes: '1024x1024',
    },
    {
      url: '/images/icon-512.png',
      type: 'image/png',
      sizes: '512x512',
    },
    {
      url: '/images/icon-384.png',
      type: 'image/png',
      sizes: '384x384',
    },
    {
      url: '/images/icon-256.png',
      type: 'image/png',
      sizes: '256x256',
    },
    {
      url: '/images/icon-192.png',
      type: 'image/png',
      sizes: '192x192',
    },
    {
      url: '/images/icon-180.png',
      type: 'image/png',
      sizes: '180x180',
    },
    {
      url: '/images/icon-152.png',
      type: 'image/png',
      sizes: '152x152',
    },
    {
      url: '/images/icon-144.png',
      type: 'image/png',
      sizes: '144x144',
    },
    {
      url: '/images/icon-128.png',
      type: 'image/png',
      sizes: '128x128',
    },
    {
      url: '/images/icon-120.png',
      type: 'image/png',
      sizes: '120x120',
    },
    {
      url: '/images/icon-96.png',
      type: 'image/png',
      sizes: '96x96',
    },
    {
      url: '/images/icon-72.png',
      type: 'image/png',
      sizes: '72x72',
    },
  ],
}

const Layout = async ({ children }: Props) => {
  /**
   * Note: It's very important to map the data here.
   * Otherwise, the entire dataset will be loaded into each page (since this is a layout)
   * which will bloat the website. We _only_ want metatdata here.
   */
  const blog: Meta[] = (await getSortedContentData('Blog')).map(({ id, title, date }) => ({
    id,
    title,
    date,
  }))
  const chapters: ChapterMeta[] = (await getSortedContentData('Chapters')).map(
    ({ type, id, title, date, volumeNo, volumeName, chapterNo, tags }) => ({
      type,
      id,
      title,
      date,
      volumeNo,
      volumeName,
      chapterNo,
      tags,
    }),
  )
  const lore: LoreMeta[] = (await getSortedContentData('Lore')).map(({ type, id, title, date, tags, category }) => ({
    type,
    id,
    title,
    date,
    tags,
    category,
  }))
  const history: HistoryMeta[] = await getSortedContentData('History')

  return (
    <html>
      <Head>
        <title>{siteTitle}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="og:title" content={siteTitle} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body>
        <div className={styles.container}>
          <Providers content={{ blog, chapters, lore, history }}>
            <MainLayout>{children}</MainLayout>
          </Providers>
        </div>
      </body>
    </html>
  )
}

export default Layout
