import { generateRSS, getSortedContentData } from '../../../api/contentData'
import Post from './post'

export type Params = { id: string }

export async function generateStaticParams(): Promise<Params[]> {
  await generateRSS('Blog')
  const data = await getSortedContentData('Blog')
  return data.map(d => ({ id: encodeURIComponent(d.id) }))
}

type Props = { params: Params }

export default async function ChapterID({ params: { id } }: Props) {
  let post = (await getSortedContentData('Blog')).find(d => d.id === decodeURIComponent(id))
  if (!post) return null
  return <Post id={id} post={post} />
}
