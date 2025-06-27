'use client'
import Date from '../../../components/date'
import utilStyles from '../../../styles/utils.module.scss'
import postStyles from '../../../styles/post.module.scss'
import Header from '../../../components/Header/Header'
import ContentBlock from '../../../components/ContentBlock/ContentBlock'
import Row from '../../../components/Row'
import { classes } from '../../../lib/utils'
import ReadingOptions from '../../../components/ReadingOptions/ReadingOptions'
import { BlogData } from '../../../api/types'
import { faSliders } from '@fortawesome/free-solid-svg-icons'
import Popover from '../../../components/Popover/Popover'
import { useRouter } from 'next/navigation'

export type Props = {
  id: string
  post: BlogData
}

const Post = ({ post }: Props) => {
  const nav = useRouter()
  return (
    <div>
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
      <div className={utilStyles.lightText}></div>
      <ContentBlock>
        <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: post.html }} />
        <span className={utilStyles.coloredLink} onClick={nav.back}>
          {'← Back'}
        </span>
      </ContentBlock>
    </div>
  )
}
export default Post
