'use client'
import Link from 'next/link'
import { classes } from '../lib/utils'
import styles from './nav.module.scss'
import Image from 'next/image'
import utilStyles from '../styles/utils.module.scss'
import { useContext } from 'react'
import { ContentContext } from '../contexts/Content/Provider'

const name = 'Graescence'

const Nav = () => {
  const { posts, chapters } = useContext(ContentContext)
  const latestPost = posts[posts.length - 1]
  const latestChapter = chapters[posts.length - 1]
  return (
    <div className={classes(styles.container)}>
      <div className={styles.headingContainer}>
        <Link href="/">
          <img
            src="/images/profile.png"
            className={classes(utilStyles.borderCircle, styles.navImage)}
            alt="Profile Image"
          />
        </Link>
        <Link href="/" className={utilStyles.colorInherit}>
          <h2 className={utilStyles.headingMd}>{name}</h2>
        </Link>
      </div>
      <hr className={classes(styles.navHR)} />
      <Link className={classes(styles.link)} href="/toc">
        Table of Contents
      </Link>
      <hr className={classes(styles.navHR)} />
      <Link className={classes(styles.link)} href="/updates">
        Updates
      </Link>
      {latestChapter && <hr className={classes(styles.navHR)} />}
      {latestChapter && (
        <Link className={classes(styles.link)} href={`/chapters/${latestChapter.id}`}>
          <span className={styles.linkTitle}>Latest Chapter</span>
          <span className={styles.linkDesc}>{latestChapter.title}</span>
        </Link>
      )}
      {latestPost && <hr className={classes(styles.navHR)} />}
      {latestPost && (
        <Link className={classes(styles.link)} href={`/posts/${latestPost.id}`}>
          <span className={styles.linkTitle}>Latest Update</span>
          <span className={styles.linkDesc}>{latestPost.title}</span>
        </Link>
      )}
      <hr className={classes(styles.navHR)} />
    </div>
  )
}
export default Nav
