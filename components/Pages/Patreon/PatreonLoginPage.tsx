'use client'
import Link from 'next/link'
import { FunctionComponent, useContext, useEffect, useState } from 'react'
import { PatreonLogo } from '../../Logos/PatreonLogo'
import { classes } from '../../../lib/utils'
import styles from './page.module.scss'
import { PatreonContext } from '../../../providers/Patreon/Provider'
import { useRouter } from 'next/navigation'
import { useQueryParams } from '../../../hooks/useQueryParams'
import { isPWA, PatreonLoginState } from '../../../providers/Patreon/Api'
import { useInstallId } from '../../../hooks/useInstallId'

type Params = 'code' | 'state'

export const PatreonLoginPage: FunctionComponent = () => {
  const [params] = useQueryParams<Params>()
  const installId = useInstallId()
  const defaultLoginState: PatreonLoginState = {
    redirectUrl: '/patreon',
    installId: isPWA() ? installId : undefined,
  }
  const code = params.code
  const state = params.state || JSON.stringify(defaultLoginState)
  const loginState: PatreonLoginState = JSON.parse(state)
  const {
    state: { error },
    actions: { signIn },
  } = useContext(PatreonContext)
  const router = useRouter()

  useEffect(() => {
    if (!code) return
    signIn(code, loginState.installId).then(() => router.replace(loginState.redirectUrl))
  }, [code, loginState.installId, loginState.redirectUrl, params, router, signIn])

  return (
    <div className={styles.container}>
      <Link key={`$patreon`} className={classes(styles.hLink)} href="/patreon">
        <PatreonLogo className={styles.supportLogo} />
        <span className={styles.linkTitle}>Patreon</span>
        {error && <span>{error.message}</span>}
      </Link>
    </div>
  )
}
