'use client'
import Date from '../../date'
import utilStyles from '../../../styles/utils.module.scss'
import postStyles from '../../../styles/post.module.scss'
import Row from '../../Row'
import ContentBlock from '../../ContentBlock/ContentBlock'
import Tags from '../../Tags/Tags'
import Header from '../../Header/Header'
import ReadingOptions from '../../ReadingOptions/ReadingOptions'
import { LoreData } from '../../../staticGenerator/types'
import { faSliders } from '@fortawesome/free-solid-svg-icons'
import Popover from '../../Popover/Popover'
import { useRouter } from 'next/navigation'
import { useContext } from 'react'
import { PatreonContext } from '../../../providers/Patreon/Provider'
import { userCanAccessTier } from '../../../lib/utils'
import { AccessNeeded } from '../../Patreon/AccessNeeded'

export type Props = {
  id: string
  lore: LoreData
}

const Lore = ({ lore }: Props) => {
  const { title, date, html, tags, category } = lore
  const nav = useRouter()
  const {
    state: { user },
  } = useContext(PatreonContext)
  const hasAccess = lore.isPublic || userCanAccessTier(user, 'world')
  return (
    <div className={utilStyles.pageMain}>
      <Header type="Primary">
        <Row horizontal="space-between" vertical="center">
          {title}
          <Popover icon={faSliders} name="ReadingOptions">
            <ReadingOptions />
          </Popover>
        </Row>
      </Header>
      <Header type="Secondary">
        <Row horizontal="space-between" vertical="center">
          <span>{category}</span>
          <span className={utilStyles.smallText}>{date && <Date dateString={date} />}</span>
        </Row>
      </Header>
      <ContentBlock>
        {tags.length > 0 && <Tags tags={tags} />}
        {hasAccess ? (
          <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <AccessNeeded tier="world" content={html} isAlreadyLinked={user !== undefined} />
        )}
      </ContentBlock>
      <Row className={utilStyles.hPadding}>
        <span className={utilStyles.coloredLink} onClick={nav.back}>
          {'← Back'}
        </span>
      </Row>
    </div>
  )
}
export default Lore
