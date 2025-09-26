import Link from 'next/link'
import Row from '../../components/Row'
import styles from './ExcerptItem.module.scss'
import postStyles from '../../styles/post.module.scss'
import utilStyles from '../../styles/utils.module.scss'
import DateView from '../../components/date'
import Tags from '../Tags/Tags'
import { createURL } from '../Pages/History/utils/createURL'
import { useContext } from 'react'
import { PatreonContext } from '../../providers/Patreon/Provider'
import { classes, TierData, userCanAccessTier } from '../../lib/utils'
import { AccessNeeded } from '../Patreon/AccessNeeded'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AccessTier } from '../../app/api/types'
import { ProgressContext } from '../../providers/Progress/Provider'

export type Props = {
  type: 'lore' | 'history' | 'blog'
  slug: string
  uuid: string
  title: string
  excerpt: string
  tier: AccessTier
  publicDate?: string
  date?: string
  subTitle?: string
  tags?: string[]
  passThroughQuery?: URLSearchParams | Record<string, string | undefined>
}
export const ExcerptItem = ({
  type,
  slug,
  uuid,
  title,
  date,
  excerpt,
  passThroughQuery,
  tags,
  subTitle,
  tier,
  publicDate,
}: Props) => {
  const user = useContext(PatreonContext).state.user
  const isPublic = publicDate && Date.now() >= new Date(publicDate).getTime()
  const canAccess = isPublic || userCanAccessTier(user, tier)
  const isLinked = user !== undefined
  const itemProgress = useContext(ProgressContext).state.progress[uuid]?.progress

  return (
    <div className={styles.container}>
      <Link href={createURL(`/${type}/${slug}`, passThroughQuery)}>
        <Row className={styles.headerRow} horizontal="space-between" vertical="center">
          <Row style={{ gap: 5 }}>
            <div className={styles.header}>{title}</div>
            {tags && <Tags tags={tags} type="secondary" />}
          </Row>
          {!isPublic && tier !== 'free' && <FontAwesomeIcon className={styles.tierIcon} icon={TierData[tier].icon} />}
          {subTitle && <span className={styles.subTitle}>{subTitle}</span>}
          {date && (
            <span className={styles.date}>
              <DateView dateString={date} />
            </span>
          )}
        </Row>
      </Link>
      <div className={styles.content}>
        {canAccess ? (
          <div className={styles.excerpt}>
            <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: excerpt }} />
            <Row horizontal="end" vertical="center">
              <Link
                className={classes(utilStyles.coloredLink, styles.moreLink)}
                href={createURL(`/${type}/${slug}`, passThroughQuery)}>
                <span>More →</span>
              </Link>
            </Row>
          </div>
        ) : (
          <AccessNeeded tier={tier} isAlreadyLinked={isLinked} content={excerpt} publicDate={publicDate} />
        )}
        <div className={styles.progressContainer}>
          {itemProgress && <div style={{ width: `${itemProgress * 100}%` }} className={styles.progressIndicator} />}
        </div>
      </div>
    </div>
  )
}
