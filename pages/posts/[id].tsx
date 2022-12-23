import Layout from '../../components/layout'
import { getAllPostIds, getPostData, PostData, PostID } from '../../lib/posts'
import { StaticParam, StaticProps } from '../../lib/types'
import Date from '../../components/date'
import utilStyles from '../../styles/utils.module.css'

export type Props = {
  postData: PostData
}

const Post = ({ postData }: Props) => {
  return (
    <Layout>
      <h1 className={utilStyles.headingLg}>{postData.title}</h1>
      <div className={utilStyles.lightText}>
        <Date dateString={postData.date} />
      </div>
      <br />
      <br />
      <div style={{ padding: 30 }} dangerouslySetInnerHTML={{ __html: postData.html }} />
    </Layout>
  )
}
export default Post

export const getStaticPaths = () => {
  const paths = getAllPostIds()
  return {
    paths,
    fallback: false,
  }
}

export const getStaticProps = async ({ params }: StaticParam<PostID>): Promise<StaticProps<{ postData: PostData }>> => {
  const postData: PostData = await getPostData(params.id)
  return {
    props: { postData },
  }
}
