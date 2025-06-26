import { generateRSS, getSortedContentData } from '../../../api/contentData'
import History from './History'

export type Params = {
  id: string
}

export async function generateStaticParams(): Promise<Params[]> {
  generateRSS('History')
  const data = await getSortedContentData('History')
  return data.map(d => ({ id: d.id }))
}

type Props = {
  params: Params
}

export default async function PageData({ params: { id } }: Props) {
  const history = await getSortedContentData('History')
  const item = history.find(l => l.id === id)
  if (!item) return { notFound: true }
  return <History id={id} item={item} />
}
