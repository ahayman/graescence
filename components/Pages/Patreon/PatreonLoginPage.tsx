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
    if (!code || signingIn.current) return
    signingIn.current = true
    signIn(code).then(() => router.replace(redirectUrl))
  }, [code, params, redirectUrl, router, signIn])

  return (
    <div className={styles.container}>
      <Link key={`$patreon`} className={classes(styles.hLink)} href="/patreon">
        <PatreonLogo className={styles.supportLogo} />
        <span className={styles.linkTitle}>Patreon</span>
      </Link>
    </div>
  )
}
