'use client'
import Date from '../../../components/date'
import utilStyles from '../../../styles/utils.module.scss'
import postStyles from '../../../styles/post.module.scss'
import Header from '../../../components/Header/Header'
import ContentBlock from '../../../components/ContentBlock/ContentBlock'
import Row from '../../../components/Row'
import { classes } from '../../../lib/utils'
import ReadingOptions from '../../../components/ReadingOptions/ReadingOptions'
import { BlogData } from '../../../staticGenerator/types'
import { faSliders } from '@fortawesome/free-solid-svg-icons'
import Popover from '../../../components/Popover/Popover'
import { useRouter } from 'next/navigation'
import { Reader } from '../../Reader/Reader'

export type Props = {
  id: string
  post: BlogData
}

export const BlogPost = ({ post }: Props) => {
  const nav = useRouter()
  return (
    <div className={utilStyles.pageMain}>
      <Header type="Primary">
        <Row horizontal="space-between" vertical="center">
          {post.title}
          <Popover icon={faSliders} name="ReadingOptions">
            <ReadingOptions />
          </Popover>
        </Row>
      </Header>
      <Header type="Secondary">
        <span className={classes(utilStyles.lightText, utilStyles.smallText)}>
          <Date dateString={post.date} />
        </span>
      </Header>
      <Reader {...post} tier="free" nav={{ prev: { title: 'Back', onClick: nav.back } }} />
    </div>
  )
}
