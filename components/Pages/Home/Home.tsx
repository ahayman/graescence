'use client'
import utilStyles from '../../../styles/utils.module.scss'
import postStyles from '../../../styles/post.module.scss'
import s from './Home.module.scss'
import Link from 'next/link'
import { classes } from '../../../lib/utils'
import { useContext, useMemo } from 'react'
import { ContentContext } from '../../../providers/Content/Provider'
import Column from '../../Column'
import { ProgressContext } from '../../../providers/Progress/Provider'
import Image from 'next/image'
import Row from '../../Row'
import { GeneratedContentType } from '../../../staticGenerator/types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRssSquare } from '@fortawesome/free-solid-svg-icons'

export interface Props {
  content: string
}

export const isPWA = () =>
  typeof window !== 'undefined' &&
  (['fullscreen', 'standalone', 'minimal-ui'].some(mode => window.matchMedia(`(display-mode: ${mode})`).matches) ||
    ('standalone' in window.navigator && window.navigator.standalone) ||
    document.referrer.includes('android-app://'))

const feedTypes: GeneratedContentType[] = ['Blog', 'Chapters', 'Lore', 'History']
const contentTitle: { [type in GeneratedContentType]: string } = {
  Blog: 'Blog',
  Chapters: 'Chapter',
  History: 'World History',
  Lore: 'Lore',
}

export const Home = ({ content }: Props) => {
  const { chapters, blog } = useContext(ContentContext)
  const {
    state: { currentChapter: chapterProgress },
  } = useContext(ProgressContext)
  const currentChapter = useMemo(
    () => chapters.find(c => c.uuid === chapterProgress?.id) ?? chapters[0],
    [chapters, chapterProgress],
  )
  const firstChapter = chapters[0]
  const latestChapter = chapters[chapters.length - 1]
  const latestPost = blog[0]

  const renderInfoBlock = (header: string, title: string, link: string) => (
    <Link href={link} className={classes(s.infoBlock, utilStyles.scaleHover)}>
      <div className={s.infoHeader}>{header}</div>
      <Row vertical="center" horizontal="center" style={{ flex: 1 }}>
        <div className={s.infoData}>{title}</div>
      </Row>
    </Link>
  )

  return (
    <div className={utilStyles.pageMain}>
      <Column className={s.mainContainer}>
        <div className={s.infoContainer}>
          {currentChapter
            ? renderInfoBlock('Continue', currentChapter.title, `/chapters/${currentChapter.slug}`)
            : renderInfoBlock('Begin', firstChapter.title, `/chapters/${firstChapter.slug}`)}
          {latestChapter &&
            latestChapter !== currentChapter &&
            renderInfoBlock('Latest', latestChapter.title, `/chapters/${latestChapter.slug}`)}
          {latestPost && renderInfoBlock('Blog', latestPost.title, `/blog/${latestPost.slug}`)}
        </div>
        <Row horizontal="center">
          <Image
            className={utilStyles.roundedCorners}
            src="/images/GraescenceCover.png"
            alt="Cover Artwork"
            layout="responsive"
            style={{ minWidth: 150, maxWidth: 400 }}
            width={400}
            height={533.2}
          />
        </Row>
        <div className={s.content}>
          <div className={classes(postStyles.post, s.supportContainer)} dangerouslySetInnerHTML={{ __html: content }} />
          <div className={classes(postStyles.post, s.supportContainer)}>
            <h4>Follow & Support</h4>
            <p>
              To support this project and get the latest updates and content, you can subscribe to my{' '}
              <Link
                className={classes(utilStyles.coloredLink, utilStyles.scaleHover)}
                href="https://patreon.com/apoetsanon">
                Patreon
              </Link>{' '}
              and then{' '}
              <Link className={classes(utilStyles.coloredLink, utilStyles.scaleHover)} href="/patreon">
                link your Patreon account here
              </Link>
              .
            </p>
            <Row className={s.rssContainer}>
              <p>RSS Feeds are also provided:</p>
            </Row>
            <ul>
              {feedTypes.map(type => (
                <li key={`rss-feed-${type}`}>
                  <Link
                    className={classes(utilStyles.coloredLink, utilStyles.scaleHover)}
                    href={`/feeds/${type}/feed.xml`}>
                    <span>{`${contentTitle[type]} Feed`}</span>
                    <FontAwesomeIcon className={s.rssIcon} icon={faRssSquare} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={classes(postStyles.post, s.supportContainer)}>
            {!isPWA() && (
              <div>
                <h4>PWA Install</h4>
                <p>
                  This website can be installed as a separate app on your device as a PWA (progressive web app). This
                  allows you to interact with the website as though it were a native app, removing navigation bars and
                  other browser-specific items, which provides a much cleaner reading experience. Not all browsers
                  support installing PWAs. On some devices (Apple devices), installing a website will require you to
                  re-link your Patreon account.
                </p>
                <ul>
                  <li className={s.pwaLi} key={`pwa-ios`}>
                    <span>
                      <strong>iOS Devices</strong> (iPhone, iPad): Tap on the Share button in your toolbar at the bottom
                      (usually an arrow pointing out of a box) and select the &quot;Add to Home Screen&quot; option.
                    </span>
                  </li>
                  <li className={s.pwaLi} key={`pwa-android`}>
                    <span>
                      <strong>Android Devices</strong> (Chrome): On the right of the address bar, tap More (usually
                      three dots) and then &quot;Add to home screen&quot; and then &quot;Install&quot;.
                    </span>
                  </li>
                  <li className={s.pwaLi} key={`pwa-safari`}>
                    <span>
                      <strong>Safari</strong> (MacOS): Click on the Share button in your toolbar at the top of the
                      screen (usually an arrow pointing out of a box) and select the &quot;Add to Dock&quot; option.
                    </span>
                  </li>
                  <li className={s.pwaLi} key={`pwa-chrome`}>
                    <span>
                      <strong>Chrome</strong> (MacOS & Windows): Click on the Install App button in your search bar at
                      the top of the screen (usually an arrow pointing out of a box) and select the Install button.
                    </span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </Column>
    </div>
  )
}
