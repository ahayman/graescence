import { getSortedContentData } from '../../api/contentData'
import Blog from './Blog'

export default async function PageData() {
  return <Blog blog={await getSortedContentData('Blog')} />
}
