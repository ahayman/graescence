import { getContent } from '../../api/contentData'
import { StandardPage } from '../../components/StandardPage/StandardPage'

export default async function PageData() {
  let content = await getContent('Autism')
  return <StandardPage content={content} title="Autism" />
}
