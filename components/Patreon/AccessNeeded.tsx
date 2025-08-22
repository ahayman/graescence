import { FunctionComponent, useEffect, useState } from 'react'
import Row from '../Row'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { classes, TierData } from '../../lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { AccessTier } from '../../app/api/types'
import Column from '../Column'

import styles from './index.module.scss'
import postStyles from '../../styles/post.module.scss'
import { getPatreonLoginUrl } from '../../providers/API/getPatreonLoginUrl'
import { formatDistanceToNow } from 'date-fns'

type Props = {
  tier: AccessTier
  content?: string
  isAlreadyLinked: boolean
  publicDate?: string
  className?: string
  largeLayout?: boolean
}

export const AccessNeeded: FunctionComponent<Props> = ({
  tier,
  isAlreadyLinked,
  content,
  className,
  largeLayout,
  publicDate,
}) => {
  const path = usePathname() ?? '/patreon'
  const router = useRouter()
  const textArray = content?.split(/(?<=>[^<>]*?)\s(?=[^<>]*?<)/) // Split the text into words without
  const [timeUntilPublic, setTimeUntilPublic] = useState(publicDate ? formatDistanceToNow(publicDate) : undefined)
  const __html = textArray?.slice(0, largeLayout ? 200 : 100).join(' ')
  const tierText = timeUntilPublic?.includes('ago')
    ? 'Refresh page to see content'
    : `${TierData[tier].title} Tier Required` + (timeUntilPublic ? ` (unlocks in ${timeUntilPublic})` : '')

  const routeToPatreonAuth = () => {
    router.push(getPatreonLoginUrl(path))
  }

  useEffect(() => {
    if (!publicDate || !timeUntilPublic) return
    let updateIn = timeUntilPublic.includes('day')
      ? 1000 * 24 * 60 * 60 // 1 day
      : timeUntilPublic.includes('hour')
      ? 1000 * 60 * 60 // 1 hour
      : timeUntilPublic.includes('minute')
      ? 1000 * 60 // 1 minute
      : timeUntilPublic.includes('second')
      ? 1000 // 1 second
      : 1000 * 60 // default to 1 minute

    const timeoutHandler = setTimeout(() => setTimeUntilPublic(formatDistanceToNow(publicDate)), updateIn)
    return () => {
      clearTimeout(timeoutHandler)
    }
  }, [timeUntilPublic, publicDate])

  return (
    <Column className={classes(styles.container, className)} vertical="center" horizontal="space-between">
      {__html && (
        <div className={classes(styles.content, largeLayout ? styles.largeContent : undefined)}>
          <div className={classes(postStyles.post)} dangerouslySetInnerHTML={{ __html }} />
          <div className={styles.overlay} />
        </div>
      )}
      <Row vertical="center" horizontal="space-between">
        <span className={classes(largeLayout ? styles.largeTier : undefined)}>
          <FontAwesomeIcon className={styles.tierIcon} icon={TierData[tier].icon} />
          {tierText}
        </span>
        {isAlreadyLinked ? (
          <Link
            className={classes(styles.hLink, styles.loginButton, largeLayout ? styles.largeButton : undefined)}
            href="https://patreon.com/apoetsanon">
            <span>Subscribe</span>
          </Link>
        ) : (
          <div
            className={classes(styles.hLink, styles.loginButton, largeLayout ? styles.largeButton : undefined)}
            onClick={routeToPatreonAuth}>
            <span>Link Patreon</span>
          </div>
        )}
      </Row>
    </Column>
  )
}
