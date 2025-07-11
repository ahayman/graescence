import { generateRSS, getSortedContentData } from '../../../api/contentData'
import Chapter from './chapter'

export type Params = { id: string }

export async function generateStaticParams(): Promise<Params[]> {
  generateRSS('Chapters')
  const data = await getSortedContentData('Chapters')
  return data.map(d => ({ id: encodeURIComponent(d.id) }))
}

type Props = {
  params: Params
}

export default async function PageData({ params: { id } }: Props) {
  let chapter = (await getSortedContentData('Chapters')).find(c => c.id === decodeURIComponent(id))
  if (!chapter) return null
  return <Chapter id={id} chapter={chapter} />
}
