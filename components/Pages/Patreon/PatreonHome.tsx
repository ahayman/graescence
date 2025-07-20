'use client'
import Link from 'next/link'
import { FunctionComponent, useContext, useState } from 'react'
import { classes, TierData } from '../../../lib/utils'
import { PatreonLogo } from '../../../components/Logos/PatreonLogo'
import { PatreonContext } from '../../../providers/Patreon/Provider'
import Column from '../../../components/Column'
import Row from '../../../components/Row'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'

import utilStyles from '../../../styles/utils.module.scss'
import postStyles from '../../../styles/post.module.scss'
import styles from './page.module.scss'

import { content } from './content'
import { useRouter } from 'next/navigation'
import { getPatreonLoginUrl } from '../../../providers/API/getPatreonLoginUrl'
import { AccessTier } from '../../../app/api/types'

export const PatreonHome: FunctionComponent = () => {
  const {
    state: { user, error },
    actions: { logout },
  } = useContext(PatreonContext)
  const router = useRouter()
  const [privacyExpanded, setPrivacyExpanded] = useState(false)

  const routeToPatreonAuth = () => {
    router.push(getPatreonLoginUrl('/patreon'))
  }

  return (
    <Column horizontal="center" className={classes(utilStyles.pageMain, styles.main)}>
      <Link key={`$patreon`} className={classes(styles.hLink)} href="https://patreon.com/apoetsanon">
        <PatreonLogo className={styles.supportLogo} />
        <span className={styles.patreonTitle}>{content.home.title}</span>
      </Link>
      {error && (
        <div className={styles.contentBlock}>
          <span className={styles.error}>{error.message}</span>
        </div>
      )}
      <div className={styles.contentBlock}>
        <div className={postStyles.post}>
          {content.home.content.map((c, idx) => (
            <p key={`${content.home.title}-content-${idx}`} dangerouslySetInnerHTML={{ __html: c }} />
          ))}
        </div>
      </div>
      <div className={styles.contentBlock}>
        {user && (
          <>
            <h3>{`Welcome ${user.fullName}!`}</h3>
            <TierBlock tier={user.tier} />
          </>
        )}
      </div>
      {user ? (
        <Row>
          <div className={classes(styles.hLink, styles.logoutButton)} onClick={logout}>
            <span className={styles.linkTitle}>Unlink Patreon Account</span>
          </div>
        </Row>
      ) : (
        <Row>
          <div className={classes(styles.hLink, styles.loginButton)} onClick={routeToPatreonAuth}>
            <span className={styles.linkTitle}>Link Patreon Account</span>
          </div>
        </Row>
      )}
      <div className={styles.contentBlock}>
        <PrivacyPolicy expanded={privacyExpanded} toggleState={() => setPrivacyExpanded(c => !c)} />
      </div>
    </Column>
  )
}

const TierBlock: FunctionComponent<{ tier: AccessTier }> = ({ tier }) => (
  <Column className={styles.tierBlock}>
    <h2>
      <Row className={styles.tierHeaderRow} vertical="center">
        <FontAwesomeIcon className={styles.tierIcon} icon={TierData[tier].icon} />
        <span>{content[tier].title}</span>
      </Row>
    </h2>
    <div className={postStyles.post}>
      {content[tier].content.map((c, idx) => (
        <p key={`${tier}-content-${idx}`}>{c}</p>
      ))}
    </div>
  </Column>
)

const PrivacyPolicy: FunctionComponent<{ expanded: boolean; toggleState: () => void }> = ({
  expanded,
  toggleState,
}) => (
  <Column>
    <div onClick={toggleState}>
      <Row className={styles.privacyHeaderRow} vertical="center">
        <FontAwesomeIcon className={styles.tierIcon} icon={expanded ? faChevronDown : faChevronUp} />
        <span>{content['privacy'].title}</span>
      </Row>
    </div>
    <div className={classes(postStyles.post, expanded ? styles.expanded : styles.collapsed, styles.privacyContent)}>
      {content['privacy'].content.map((c, idx) => (
        <p key={`privacy-content-${idx}`}>{c}</p>
      ))}
    </div>
  </Column>
)
