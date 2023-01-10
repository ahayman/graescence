import { getAllContentIds, generateRSS } from '../../../api/contentData'
import Chapter from './chapter'

export type Params = {
  id: string
}

export async function generateStaticParams(): Promise<Params[]> {
  generateRSS('chapters')
  const ids = await getAllContentIds('chapters')
  return ids.map(p => ({ id: p.params.id }))
}

type Props = {
  params: Params
}

export default function ChapterID({ params: { id } }: Props) {
  return <Chapter id={id} />
}
