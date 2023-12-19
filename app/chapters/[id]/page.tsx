import { generateRSS, getSortedContentData } from '../../../api/contentData'
import Chapter from './chapter'

export type Params = { id: string }

export async function generateStaticParams(): Promise<Params[]> {
  generateRSS('Chapters')
  const data = await getSortedContentData('Chapters')
  return data.map(d => ({ id: d.id }))
}

type Props = {
  params: Params
}

export default async function PageData({ params: { id } }: Props) {
  let chapter = (await getSortedContentData('Chapters')).find(c => c.id === id)!
  return <Chapter id={id} chapter={chapter} />
}
