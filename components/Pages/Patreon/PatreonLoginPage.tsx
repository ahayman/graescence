'use client'
import Link from 'next/link'
import { FunctionComponent, useContext, useEffect, useState } from 'react'
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
  const redirect = params.state || '/patreon'
  const [error, setError] = useState<string>()
  const {
    actions: { signIn },
  } = useContext(PatreonContext)
  const router = useRouter()

  useEffect(() => {
    if (!code) return setError('Missing Code. Please try again')
    signIn(code)
      .then(() => router.replace(redirect))
      .catch(error => setError(error.message || JSON.stringify(error)))
  }, [code, params, redirect, router, signIn])

  return (
    <div className={styles.container}>
      <Link key={`$patreon`} className={classes(styles.hLink)} href="/patreon">
        <PatreonLogo className={styles.supportLogo} />
        <span className={styles.linkTitle}>Patreon</span>
        {error && <span>{error}</span>}
      </Link>
    </div>
  )
}
