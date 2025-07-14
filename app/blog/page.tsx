import Blog from '../../components/Pages/Blog/Blog'
import { getSortedContentData } from '../../staticGenerator/contentData'

export default async function PageData() {
  return <Blog blog={await getSortedContentData('Blog')} />
}
