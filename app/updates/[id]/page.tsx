import { getAllContentIds, generateRSS } from '../../../api/contentData'
import Post from './post'

export type Params = {
  id: string
}

export async function generateStaticParams(): Promise<Params[]> {
  await generateRSS('updates')
  const ids = await getAllContentIds('updates')
  return ids.map(p => ({ id: p.params.id }))
}

type Props = {
  params: Params
}

export default function ChapterID({ params: { id } }: Props) {
  return <Post id={id} />
}
