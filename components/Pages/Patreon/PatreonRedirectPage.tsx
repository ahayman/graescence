'use client'
import Link from 'next/link'
import { FunctionComponent, useContext, useEffect } from 'react'
import { PatreonLogo } from '../../Logos/PatreonLogo'
import { classes } from '../../../lib/utils'
import { AuthData, UserData } from '../../../providers/Patreon/Api'
import styles from './page.module.scss'
import { PatreonContext } from '../../../providers/Patreon/Provider'
import { useRouter } from 'next/navigation'

type Props = {
  authData: AuthData
  userData: UserData
}

export const PatreonRedirectPage: FunctionComponent<Props> = ({ authData, userData }) => {
  const { actions } = useContext(PatreonContext)
  const router = useRouter()

  useEffect(() => {
    actions.handleAuth(authData, userData)
    router.replace('/patreon')
  }, [authData, userData])

  return (
    <div className={styles.container}>
      <Link key={`$patreon`} className={classes(styles.hLink)} href="/patreon">
        <PatreonLogo className={styles.supportLogo} />
        <span className={styles.linkTitle}>Patreon</span>
      </Link>
    </div>
  )
}
