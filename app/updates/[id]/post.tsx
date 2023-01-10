'use client'
import Date from '../../../components/date'
import utilStyles from '../../../styles/utils.module.scss'
import postStyles from '../../../styles/post.module.scss'
import { useContext } from 'react'
import { ContentContext } from '../../../providers/Content/Provider'
import Header from '../../../components/Header/Header'
import ContentBlock from '../../../components/ContentBlock/ContentBlock'
import Row from '../../../components/Row'
import { classes } from '../../../lib/utils'

export type Props = {
  id: string
}

const Post = ({ id }: Props) => {
  const { updates } = useContext(ContentContext)
  const postData = updates.find(p => p.id === id)
  if (!postData) {
    return <div>No Post Found</div>
  }
  return (
    <div>
      <Header type="Primary">
        <Row horizontal="space-between" vertical="center">
          <span>{postData.title}</span>
          <span className={classes(utilStyles.lightText, utilStyles.smallText)}>
            <Date dateString={postData.date} />
          </span>
        </Row>
      </Header>
      <div className={utilStyles.lightText}></div>
      <ContentBlock>
        <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: postData.html }} />
      </ContentBlock>
    </div>
  )
}
export default Post
