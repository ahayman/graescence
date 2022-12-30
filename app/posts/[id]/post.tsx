'use client'
import Date from '../../../components/date'
import utilStyles from '../../../styles/utils.module.scss'
import postStyles from '../../../styles/post.module.scss'
import { useContext } from 'react'
import { ContentContext } from '../../../contexts/Content/Provider'

export type Props = {
  id: string
}

const Post = ({ id }: Props) => {
  const { posts } = useContext(ContentContext)
  const postData = posts.find(p => p.id === id)
  if (!postData) {
    return <div>No Post Found</div>
  }
  return (
    <>
      <h1 className={utilStyles.headingLg}>{postData.title}</h1>
      <div className={utilStyles.lightText}>
        <Date dateString={postData.date} />
      </div>
      <br />
      <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: postData.html }} />
    </>
  )
}
export default Post
