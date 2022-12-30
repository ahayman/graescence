import { getAllPostIds } from '../../../api/posts'
import Post from './post'

export type Params = {
  id: string
}

export async function generateStaticParams(): Promise<Params[]> {
  return getAllPostIds().map(p => ({ id: p.params.id }))
}

type Props = {
  params: Params
}

export default function ChapterID({ params: { id } }: Props) {
  return <Post id={id} />
}
