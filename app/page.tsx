import { getContent } from '../api/contentData'
import Home from './Home'

export default async function PageData() {
  let content = await getContent('home')
  return <Home content={content} />
}
