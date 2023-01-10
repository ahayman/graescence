'use client'
import Link from 'next/link'
import { classes } from '../../lib/utils'
import styles from './nav.module.scss'
import Image from 'next/image'
import utilStyles from '../../styles/utils.module.scss'
import { useContext } from 'react'
import { ContentContext } from '../../providers/Content/Provider'
import { ProgressContext } from '../../providers/Progress/Provider'
import { OptionsContext } from '../../providers/Options/Provider'
import Row from '../Row'

const name = 'Graescence'

const Nav = () => {
  const {
    state: { uiTheme },
    actions: { setUITheme },
  } = useContext(OptionsContext)
  const { updates, chapters } = useContext(ContentContext)
  const {
    state: { currentChapterId },
  } = useContext(ProgressContext)
  const latestPost = updates[updates.length - 1]
  const currentIdx = currentChapterId ? chapters.byID[currentChapterId] : chapters.items.length - 1
  const currentChapter = chapters.items[currentIdx]
  return (
    <div className={classes(styles.container)}>
      <div className={styles.headingContainer}>
        <Link href="/">
          <Image
            priority
            className={classes(utilStyles.borderCircle, styles.navImage)}
            width={100}
            height={100}
            src="/images/profile.png"
            alt="Profile Image"
          />
        </Link>
        <Link href="/" className={utilStyles.colorInherit}>
          <h2 className={styles.heading}>{name}</h2>
        </Link>
        <span className={styles.subHeading}>a web novel</span>
      </div>
      <hr className={classes(styles.navHR)} />
      <hr className={classes(styles.navHR)} />
      <Link className={classes(styles.link)} href="/toc">
        Table of Contents
      </Link>
      <hr className={classes(styles.navHR)} />
      <Link className={classes(styles.link)} href="/lore">
        Lore
      </Link>
      <hr className={classes(styles.navHR)} />
      <Link className={classes(styles.link)} href="/updates">
        Updates
      </Link>
      {currentChapter && <hr className={classes(styles.navHR)} />}
      {currentChapter && (
        <Link className={classes(styles.link)} href={`/chapters/${currentChapter.id}`}>
          <span className={styles.linkTitle}>{currentIdx === 0 ? 'Begin Reading' : 'Continue Reading'}</span>
          <span className={styles.linkDesc}>
            {currentChapter.title.length > 20 ? currentChapter.title.slice(0, 17) + '...' : currentChapter.title}
          </span>
        </Link>
      )}
      {latestPost && <hr className={classes(styles.navHR)} />}
      {latestPost && (
        <Link className={classes(styles.link)} href={`/updates/${latestPost.id}`}>
          <span className={styles.linkTitle}>Latest Update</span>
          <span className={styles.linkDesc}>
            {latestPost.title.length > 20 ? latestPost.title.slice(0, 17) + '...' : latestPost.title}
          </span>
        </Link>
      )}
      <hr className={classes(styles.navHR)} />
      <div style={{ flex: 1 }} />
      <Row vertical="center" horizontal="center">
        <div
          className={classes(
            utilStyles.leftRounded,
            uiTheme === 'light' ? styles.themeButtonSelect : styles.themeButton,
          )}
          onClick={() => setUITheme('light')}>
          Light
        </div>
        <div
          className={classes(
            utilStyles.rightRounded,
            uiTheme === 'dark' ? styles.themeButtonSelect : styles.themeButton,
          )}
          onClick={() => setUITheme('dark')}>
          Dark
        </div>
      </Row>
    </div>
  )
}
export default Nav
