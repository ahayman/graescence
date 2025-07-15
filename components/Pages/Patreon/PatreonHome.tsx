'use client'
import Link from 'next/link'
import { FunctionComponent, useContext } from 'react'
import { classes } from '../../../lib/utils'
import { PatreonLogo } from '../../../components/Logos/PatreonLogo'
import styles from './page.module.scss'
import ContentBlock from '../../../components/ContentBlock/ContentBlock'
import { PatreonContext } from '../../../providers/Patreon/Provider'
import Column from '../../../components/Column'
import Row from '../../../components/Row'
import { clientID, redirectUrl } from '../../../providers/Patreon/Api'

const loginUrl = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${clientID}&redirect_uri=${redirectUrl}`

export const PatreonHome: FunctionComponent = () => {
  const {
    state: { user },
    actions: { logout },
  } = useContext(PatreonContext)
  return (
    <div className={styles.container}>
      <Link key={`$patreon`} target="_blank" className={classes(styles.hLink)} href="https://patreon.com/apoetsanon">
        <PatreonLogo className={styles.supportLogo} />
        <span className={styles.linkTitle}>Patreon</span>
      </Link>
      <ContentBlock>
        {user ? (
          <Column>
            <span>User Logged In</span>
            <span>{`Current Membership Tier: ${user.patreonTier}`}</span>
            <Row>
              <div className={classes(styles.hLink, styles.loginButton)} onClick={logout}>
                <span className={styles.linkTitle}>Unlink Patreon Account</span>
              </div>
            </Row>
          </Column>
        ) : (
          <Row>
            <Link className={classes(styles.hLink, styles.loginButton)} href={loginUrl}>
              <span className={styles.linkTitle}>Link Patreon Account</span>
            </Link>
          </Row>
        )}
      </ContentBlock>
    </div>
  )
}
