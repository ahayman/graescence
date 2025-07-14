import { generateRSS, getSortedContentData } from '../../../staticGenerator/contentData'
import History from './History'

export type Params = {
  id: string
}

export async function generateStaticParams(): Promise<Params[]> {
  generateRSS('History')
  const data = await getSortedContentData('History')
  return data.map(d => ({ id: encodeURIComponent(d.id) }))
}

type Props = {
  params: Promise<Params>
}

export default async function PageData({ params }: Props) {
  const id = (await params).id
  const history = await getSortedContentData('History')
  const item = history.find(l => l.id === decodeURIComponent(id))
  if (!item) return null
  return <History id={id} item={item} />
}
