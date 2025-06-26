'use client'
import Link from 'next/link'
import { MouseEvent, useMemo, useRef } from 'react'
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
import { PatreonLogo } from '../Logos/PatreonLogo'

const name = 'Graescence'

const Nav = () => {
  const {
    state: { uiTheme },
    actions: { setUITheme },
  } = useContext(OptionsContext)
  const { blog, chapters } = useContext(ContentContext)
  const {
    state: { currentChapterId },
  } = useContext(ProgressContext)
  const [showMenu, setShowMenu] = useState(false)
  const [menuPos, setMenuPos] = useState(0)
  const currentChapter = useMemo(
    () => chapters.find(c => c.id === currentChapterId) ?? chapters[0],
    [chapters, currentChapterId],
  )
  const latestPost = blog[blog.length - 1]
  const clickDiscardIds = useRef(new Set<string>()).current

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

  const navItems = (type: 'desktop' | 'mobile'): ReactNode[] =>
    [
      type === 'mobile' ? (
        <Link key={`${type}-toc`} className={classes(styles.link)} href="/">
          Home
        </Link>
      ) : null,
      <Link key={`${type}-blog`} className={classes(styles.link)} href="/blog">
        Blog
      </Link>,
      <Link key={`${type}-toc`} className={classes(styles.link)} href="/toc">
        Table of Contents
      </Link>,
      <Link key={`${type}-lore`} className={classes(styles.link)} href="/lore">
        Lore
      </Link>,
      <Link key={`${type}-history`} className={classes(styles.link)} href="/history">
        World History
      </Link>,
      currentChapter ? (
        <Link key={`${type}-currentChapter`} className={classes(styles.link)} href={`/chapters/${currentChapter.id}`}>
          <span className={styles.linkTitle}>{!currentChapterId ? 'Begin Reading' : 'Continue Reading'}</span>
          <span className={styles.linkDesc}>
            {currentChapter.title.length > 20 ? currentChapter.title.slice(0, 17) + '...' : currentChapter.title}
          </span>
        </Link>
      ) : null,
      latestPost ? (
        <Link key={`${type}-latestPost`} className={classes(styles.link)} href={`/blog/${latestPost.id}`}>
          <span className={styles.linkTitle}>Latest Update</span>
          <span className={styles.linkDesc}>
            {latestPost.title.length > 20 ? latestPost.title.slice(0, 17) + '...' : latestPost.title}
          </span>
        </Link>
      ) : null,
      <Link
        key={`${type}-patreon`}
        target="_blank"
        className={classes(styles.hLink)}
        href="https://patreon.com/apoetsanon">
        <PatreonLogo className={styles.supportLogo} />
        <span className={styles.linkTitle}>Patreon</span>
      </Link>,
      // <Link
      //   key={`${type}-RoyalRoad`}
      //   target="_blank"
      //   className={classes(styles.hLink)}
      //   href="https://www.royalroad.com/profile/280073">
      //   <Image
      //     src={uiTheme === 'dark' ? '/images/RR-gold.png' : '/images/RR-silver.png'}
      //     alt="Royal Road Logo"
      //     width={20}
      //     height={20}
      //   />
      //   <span className={styles.linkTitle}>oyal Road</span>
      // </Link>,
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
        <hr className={styles.navHR} />
        {themeSelector('desktop')}
      </div>
      <div className={styles.mobileContainer} onClick={event => toggleNav(event)}>
        <FontAwesomeIcon id="menuIcon" icon={faBars} className={styles.icon} />
        <div className={classes(styles.menuContainer, showMenu ? styles.menuShowing : styles.menuHiding)}>
          <div style={{ marginTop: menuPos }} className={classes(styles.menu)}>
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
