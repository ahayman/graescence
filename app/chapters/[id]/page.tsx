import { getAllChapterIds } from '../../../api/chapters'
import Chapter from './chapter'

export type Params = {
  id: string
}

export async function generateStaticParams(): Promise<Params[]> {
  return getAllChapterIds().map(p => ({ id: p.params.id }))
}

type Props = {
  params: Params
}

export default function ChapterID({ params: { id } }: Props) {
  return <Chapter id={id} />
}
