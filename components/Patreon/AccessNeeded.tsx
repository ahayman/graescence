import { FunctionComponent } from 'react'
import Row from '../Row'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Link from 'next/link'
import { classes, TierData } from '../../lib/utils'
import { usePathname } from 'next/navigation'
import { AccessTier } from '../../app/api/patreon/types'
import Column from '../Column'

import styles from './index.module.scss'
import postStyles from '../../styles/post.module.scss'
import { getPatreonLoginUrl } from '../../providers/Patreon/Api'

type Props = {
  tier: AccessTier
  content?: string
  isAlreadyLinked: boolean
  className?: string
}

export const AccessNeeded: FunctionComponent<Props> = ({ tier, isAlreadyLinked, content, className }) => {
  const path = usePathname() ?? ''
  const textArray = content?.split(/(?<=>[^<>]*?)\s(?=[^<>]*?<)/) // Split the text into words without
  const __html = textArray?.slice(0, 100).join(' ')
  return (
    <Column className={classes(styles.container, className)} vertical="center" horizontal="space-between">
      {__html && (
        <div className={styles.content}>
          <div className={classes(postStyles.post)} dangerouslySetInnerHTML={{ __html }} />
          <div className={styles.overlay} />
        </div>
      )}
      <Row vertical="center" horizontal="space-between">
        <span>
          <FontAwesomeIcon className={styles.tierIcon} icon={TierData[tier].icon} />
          {`${TierData[tier].title} Tier`}
        </span>
        {isAlreadyLinked ? (
          <Link className={classes(styles.hLink, styles.loginButton)} href="https://patreon.com/apoetsanon">
            <span>Subscribe</span>
          </Link>
        ) : (
          <Link className={classes(styles.hLink, styles.loginButton)} href={getPatreonLoginUrl(path)}>
            <span>Link Patreon</span>
          </Link>
        )}
      </Row>
    </Column>
  )
}
