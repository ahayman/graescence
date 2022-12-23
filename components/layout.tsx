import Head from 'next/head'
import { ReactNode } from 'react'
import styles from './layout.module.css'
import utilStyles from '../styles/utils.module.css'
import Image from 'next/image'
import Link from 'next/link'

export type Props = {
  children: ReactNode
  home?: boolean
}

export const siteTitle = 'Next.js sample website'
const name = 'Next Sample Site'

const Layout = ({ children, home }: Props) => (
  <div className={styles.container}>
    <Head>
      <link rel="icon" href="/favicon.ico" />
      <meta
        property="og:image"
        content={`https://og-image.vercel.app/${encodeURI(
          siteTitle,
        )}.png?theme=light&md=0&fontSize=75px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fnextjs-black-logo.svg`}
      />
      <meta name="og:title" content={siteTitle} />
    </Head>
    <header className={styles.header}>
      {home ? (
        <Image
          priority
          src="/images/profile.png"
          className={utilStyles.borderCircle}
          height={144}
          width={144}
          alt="Profile Image"
        />
      ) : (
        <>
          <Link href="/">
            <Image
              priority
              src="/images/profile.png"
              className={utilStyles.borderCircle}
              height={108}
              width={108}
              alt=""
            />
          </Link>
          <h2 className={utilStyles.headingMd}>
            <Link href="/" className={utilStyles.colorInherit}>
              {name}
            </Link>
          </h2>
        </>
      )}
      <hr style={{ alignSelf: 'stretch' }} />
    </header>
    <main>{children}</main>
    {!home && (
      <div className={styles.backToHome}>
        <Link href="/">← home</Link>
      </div>
    )}
  </div>
)

export default Layout
