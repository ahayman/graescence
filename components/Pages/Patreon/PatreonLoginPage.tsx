'use client'
import Link from 'next/link'
import { FunctionComponent, useContext, useEffect, useRef } from 'react'
import { PatreonLogo } from '../../Logos/PatreonLogo'
import { classes } from '../../../lib/utils'
import styles from './page.module.scss'
import { PatreonContext } from '../../../providers/Patreon/Provider'
import { useRouter } from 'next/navigation'
import { useQueryParams } from '../../../hooks/useQueryParams'

type Params = 'code' | 'state'

export const PatreonLoginPage: FunctionComponent = () => {
  const [params] = useQueryParams<Params>()
  const code = params.code
  const redirectUrl = params.state || '/patreon'
  const signIn = useContext(PatreonContext).actions.signIn
  const router = useRouter()
  const signingIn = useRef(false)

  useEffect(() => {
    if (signingIn.current) return
    if (!code) {
      setTimeout(() => router.replace(redirectUrl), 5000)
      return
    }
    signingIn.current = true
    signIn(code).finally(() => router.replace(redirectUrl))
  }, [code, params, redirectUrl, router, signIn])

  return (
    <div className={styles.container}>
      <Link key={`$patreon`} className={classes(styles.hLink)} href="/patreon">
        <PatreonLogo className={styles.supportLogo} />
        <span className={styles.patreonTitle}>Patreon</span>
      </Link>
      {!code ? (
        <>
          <span className={styles.error}>Authorization Code Missing!</span>
          <span className={styles.authText}>Redirecting...</span>
        </>
      ) : (
        <>
          <span className={styles.authText}>Authenticating...</span>
          <div className={styles['lds-roller']}>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </>
      )}
    </div>
  )
}
