'use client'
import Date from '../../../components/date'
import utilStyles from '../../../styles/utils.module.scss'
import postStyles from '../../../styles/post.module.scss'
import Header from '../../../components/Header/Header'
import ContentBlock from '../../../components/ContentBlock/ContentBlock'
import Row from '../../../components/Row'
import { classes } from '../../../lib/utils'
import ReadingOptions from '../../../components/ReadingOptions/ReadingOptions'
import { PostData } from '../../../api/contentData'

export type Props = {
  id: string
  post: PostData
}

const Post = ({ post }: Props) => {
  return (
    <div>
      <Header type="Primary">
        <Row horizontal="space-between" vertical="center">
          {post.title}
          <ReadingOptions />
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
      </ContentBlock>
    </div>
  )
}
export default Post
