import Chapter from '../../../components/Pages/Chapters/ Chapter'
import { generateRSS, getSortedContentData } from '../../../staticGenerator/contentData'

export type Params = { id: string }

export async function generateStaticParams(): Promise<Params[]> {
  generateRSS('Chapters')
  const data = await getSortedContentData('Chapters')
  return data.map(d => ({ id: encodeURIComponent(d.id) }))
}

type Props = {
  params: Promise<Params>
}

export default async function PageData({ params }: Props) {
  const id = (await params).id
  let chapter = (await getSortedContentData('Chapters')).find(c => c.id === decodeURIComponent(id))
  if (!chapter) return null
  return <Chapter id={id} chapter={chapter} />
}
