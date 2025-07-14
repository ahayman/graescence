import { Home } from '../components/Pages/Home/Home'
import { getContent } from '../staticGenerator/contentData'

export default async function PageData() {
  let content = await getContent('Home')
  return <Home content={content} />
}
