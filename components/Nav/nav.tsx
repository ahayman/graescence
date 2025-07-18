'use client'
import Link from 'next/link'
import { useMemo, useRef } from 'react'
import {} from '../../lib/array'
import { classes, isNotEmpty } from '../../lib/utils'
import styles from './nav.module.scss'
import Image from 'next/image'
import utilStyles from '../../styles/utils.module.scss'
import { ReactNode, useContext } from 'react'
import { ContentContext } from '../../providers/Content/Provider'
import { ProgressContext } from '../../providers/Progress/Provider'
import { OptionsContext } from '../../providers/Options/Provider'
import Row from '../Row'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faSun, faMoon } from '@fortawesome/free-solid-svg-icons'
import { PatreonLogo } from '../Logos/PatreonLogo'
import Column from '../Column'
import { DisplayContext } from '../../providers/Display/Provider'
import Popover from '../Popover/Popover'

const name = 'Graescence'

const Nav = () => {
  const {
    state: { uiTheme },
    actions: { setUITheme },
  } = useContext(OptionsContext)
  const { blog, chapters } = useContext(ContentContext)
  const {
    state: { currentChapter: currentChapterProgress },
  } = useContext(ProgressContext)
  const {
    actions: { toggleFullScreen },
  } = useContext(DisplayContext)
  const currentChapter = useMemo(
    () => chapters.find(c => c.uuid === currentChapterProgress?.id) ?? chapters[0],
    [chapters, currentChapterProgress?.id],
  )
  const latestPost = blog[0]
  const clickDiscardIds = useRef(new Set<string>()).current

  const themeSelector = (type: string) => {
    const id = `${type}-themeSelector`
    const darkId = `${type}-themeDarkButton`
    const lightId = `${type}-themeLightButton`
    clickDiscardIds.add(id)
    clickDiscardIds.add(darkId)
    clickDiscardIds.add(lightId)
    return (
      <Row id={id} vertical="center" horizontal="center">
        <Column
          vertical="center"
          horizontal="center"
          id={lightId}
          className={classes(
            utilStyles.leftRounded,
            styles.themeHover,
            uiTheme === 'light' ? styles.themeButtonSelect : styles.themeButton,
          )}
          onClick={() => setUITheme('light')}>
          <FontAwesomeIcon icon={faSun} />
        </Column>
        <Column
          vertical="center"
          horizontal="center"
          id={darkId}
          className={classes(
            utilStyles.rightRounded,
            styles.themeHover,
            uiTheme === 'dark' ? styles.themeButtonSelect : styles.themeButton,
          )}
          onClick={() => setUITheme('dark')}>
          <FontAwesomeIcon icon={faMoon} />
        </Column>
      </Row>
    )
  }

  const navItems = (type: 'desktop' | 'mobile'): ReactNode[] =>
    [
      <Link key={`${type}-home`} className={classes(styles.link)} href="/">
        <span>Home</span>
      </Link>,
      <Link key={`${type}-blog`} className={classes(styles.link)} href="/blog">
        <span>Blog</span>
      </Link>,
      <Link key={`${type}-toc`} className={classes(styles.link)} href="/toc">
        <span>Chapters</span>
      </Link>,
      <Link key={`${type}-lore`} className={classes(styles.link)} href="/lore">
        <span>Lore</span>
      </Link>,
      <Link key={`${type}-history`} className={classes(styles.link)} href="/history">
        <span>World History</span>
      </Link>,
      currentChapter ? (
        <Link key={`${type}-currentChapter`} className={classes(styles.link)} href={`/chapters/${currentChapter.id}`}>
          <span className={styles.linkTitle}>{!currentChapterProgress ? 'Begin Story' : 'Continue Story'}</span>
          <span className={styles.linkDesc}>
            {currentChapter.title.length > 20 ? currentChapter.title.slice(0, 17) + '...' : currentChapter.title}
          </span>
        </Link>
      ) : null,
      latestPost ? (
        <Link key={`${type}-latestPost`} className={classes(styles.link)} href={`/blog/${latestPost.id}`}>
          <span className={styles.linkTitle}>Latest Post</span>
          <span className={styles.linkDesc}>
            {latestPost.title.length > 20 ? latestPost.title.slice(0, 17) + '...' : latestPost.title}
          </span>
        </Link>
      ) : null,
      <Link key={`${type}-patreon`} className={classes(styles.hLink)} href="/patreon">
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
      <div onClick={toggleFullScreen} className={styles.headingContainer}>
        <h2 className={styles.heading}>{name}</h2>
        <span className={styles.subHeading}>a web novel</span>
      </div>
      <div className={styles.desktopContainer}>
        <hr className={styles.navHR} />
        {navItems('desktop')}
        <hr className={styles.navHR} />
        {themeSelector('desktop')}
      </div>
      <div className={styles.mobileContainer}>
        <Popover name="main menu" icon={faBars}>
          <div className={classes(styles.menu)}>
            {navItems('mobile')}
            <hr className={styles.navHR} />
            {themeSelector('mobile')}
          </div>
        </Popover>
      </div>
    </div>
  )
}
export default Nav
