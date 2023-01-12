'use client'
import Link from 'next/link'
import { MouseEvent, useRef } from 'react'
import {} from '../../lib/array'
import { classes, isNotEmpty } from '../../lib/utils'
import styles from './nav.module.scss'
import Image from 'next/image'
import utilStyles from '../../styles/utils.module.scss'
import { ReactNode, useContext, useState } from 'react'
import { ContentContext } from '../../providers/Content/Provider'
import { ProgressContext } from '../../providers/Progress/Provider'
import { OptionsContext } from '../../providers/Options/Provider'
import Row from '../Row'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { lightFormat } from 'date-fns'

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
  const [showMenu, setShowMenu] = useState(false)
  const [menuPos, setMenuPos] = useState(0)
  const latestPost = updates[updates.length - 1]
  const clickDiscardIds = useRef(new Set<string>()).current
  const currentIdx = currentChapterId ? chapters.byID[currentChapterId] : 0
  const currentChapter = chapters.items[currentIdx]

  const toggleNav = (event: MouseEvent<HTMLDivElement>) => {
    for (const id of clickDiscardIds) {
      if (event.target === document.getElementById(id)) {
        return
      }
    }
    if (showMenu) {
      setShowMenu(false)
      return
    }
    const rect = document.getElementById('menuIcon')?.getBoundingClientRect()
    if (rect) {
      setMenuPos(rect.bottom + 5)
    }
    setShowMenu(true)
  }

  const themeSelector = (type: string) => {
    const id = `${type}-themeSelector`
    const darkId = `${type}-themeDarkButton`
    const lightId = `${type}-themeLightButton`
    clickDiscardIds.add(id)
    clickDiscardIds.add(darkId)
    clickDiscardIds.add(lightId)
    return (
      <Row id={id} vertical="center" horizontal="center">
        <div
          id={lightId}
          className={classes(
            utilStyles.leftRounded,
            uiTheme === 'light' ? styles.themeButtonSelect : styles.themeButton,
          )}
          onClick={() => setUITheme('light')}>
          Light
        </div>
        <div
          id={darkId}
          className={classes(
            utilStyles.rightRounded,
            uiTheme === 'dark' ? styles.themeButtonSelect : styles.themeButton,
          )}
          onClick={() => setUITheme('dark')}>
          Dark
        </div>
      </Row>
    )
  }

  const navItems = (type: string): ReactNode[] =>
    [
      <Link key={`${type}-toc`} className={classes(styles.link)} href="/toc">
        Table of Contents
      </Link>,
      <Link key={`${type}-lore`} className={classes(styles.link)} href="/lore">
        Lore
      </Link>,
      <Link key={`${type}-updates`} className={classes(styles.link)} href="/updates">
        Updates
      </Link>,
      currentChapter && (
        <Link key={`${type}-currentChapter`} className={classes(styles.link)} href={`/chapters/${currentChapter.id}`}>
          <span className={styles.linkTitle}>{currentIdx === 0 ? 'Begin Reading' : 'Continue Reading'}</span>
          <span className={styles.linkDesc}>
            {currentChapter.title.length > 20 ? currentChapter.title.slice(0, 17) + '...' : currentChapter.title}
          </span>
        </Link>
      ),
      latestPost && (
        <Link key={`${type}-latestPost`} className={classes(styles.link)} href={`/updates/${latestPost.id}`}>
          <span className={styles.linkTitle}>Latest Update</span>
          <span className={styles.linkDesc}>
            {latestPost.title.length > 20 ? latestPost.title.slice(0, 17) + '...' : latestPost.title}
          </span>
        </Link>
      ),
    ]
      .filter(isNotEmpty)
      .joined(idx => <hr key={`${type}-nav.hr.${idx}`} className={styles.navHR} />)

  return (
    <div className={classes(styles.container)}>
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
      <div className={styles.headingContainer}>
        <Link href="/" className={utilStyles.colorInherit}>
          <h2 className={styles.heading}>{name}</h2>
        </Link>
        <span className={styles.subHeading}>a web novel</span>
      </div>
      <div className={styles.desktopContainer}>
        <hr className={styles.navHR} />
        {navItems('desktop')}
        <div style={{ flex: 1 }} />
        {themeSelector('desktop')}
      </div>
      <div className={styles.mobileContainer} onClick={event => toggleNav(event)}>
        <FontAwesomeIcon id="menuIcon" icon={faBars} className={styles.icon} />
        <div className={classes(styles.menuContainer, showMenu ? styles.menuShowing : styles.menuHiding)}>
          <div style={{ marginTop: menuPos }} className={styles.menu}>
            {navItems('mobile')}
            <hr className={styles.navHR} />
            {themeSelector('mobile')}
          </div>
        </div>
      </div>
    </div>
  )
}
export default Nav
