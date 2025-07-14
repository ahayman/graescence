'use client'
import Link from 'next/link'
import { FunctionComponent } from 'react'
import ContentBlock from '../../../../components/ContentBlock/ContentBlock'
import { PatreonLogo } from '../../../../components/Logos/PatreonLogo'
import { classes } from '../../../../lib/utils'
import { AuthData, UserData } from '../../../../providers/Patreon/Api'
import styles from '../page.module.scss'

type Props = {
  authData: AuthData
  userData: UserData
}

export const PatreonRedirectPage: FunctionComponent<Props> = ({ authData, userData }) => {
  return (
    <div className={styles.container}>
      <Link key={`$patreon`} target="_blank" className={classes(styles.hLink)} href="https://patreon.com/apoetsanon">
        <PatreonLogo className={styles.supportLogo} />
        <span className={styles.linkTitle}>Patreon</span>
      </Link>
      <ContentBlock>
        <span>=== Auth Data ====</span>
        {JSON.stringify(authData, null, 4)
          .split('\n')
          .map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        <span>=== User Data ===</span>
        {JSON.stringify(userData, null, 4)
          .split('\n')
          .map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
      </ContentBlock>
    </div>
  )
}
