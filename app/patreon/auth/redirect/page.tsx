'use client'
import Link from 'next/link'
import { FunctionComponent, useContext, useEffect } from 'react'
import { classes } from '../../../../lib/utils'
import { PatreonLogo } from '../../../../components/Logos/PatreonLogo'
import styles from '../page.module.scss'
import ContentBlock from '../../../../components/ContentBlock/ContentBlock'
import { PatreonContext } from '../../../../providers/Patreon/Provider'
import { useQueryParams } from '../../../../hooks/useQueryParams'

type QueryParam = 'code' | 'state'

const PatreonRedirectHandler: FunctionComponent = () => {
  const [params] = useQueryParams<QueryParam>()
  const authCode = params['code']
  const {
    state: { user, error },
    actions: { handleRedirectCode },
  } = useContext(PatreonContext)

  useEffect(() => {
    console.log({ authCode })
    if (authCode) handleRedirectCode(authCode)
  }, [authCode, handleRedirectCode])

  console.log({ user })
  return (
    <div className={styles.container}>
      <Link key={`$patreon`} target="_blank" className={classes(styles.hLink)} href="https://patreon.com/apoetsanon">
        <PatreonLogo className={styles.supportLogo} />
        <span className={styles.linkTitle}>Patreon</span>
      </Link>
      <ContentBlock>
        <span>{authCode ? `Loading... ${authCode}` : 'Something went wrong. Missing auth code.'}</span>
        {user && (
          <>
            {JSON.stringify(user, null, 4)
              .split('\n')
              .map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
          </>
        )}
        {error && (
          <>
            {JSON.stringify(error, null, 4)
              .split('\n')
              .map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
          </>
        )}
      </ContentBlock>
    </div>
  )
}

export default PatreonRedirectHandler
