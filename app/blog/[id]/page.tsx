import { generateRSS, getSortedContentData } from '../../../api/contentData'
import Post from './post'

export type Params = { id: string }

export async function generateStaticParams(): Promise<Params[]> {
  await generateRSS('Blog')
  const data = await getSortedContentData('Blog')
  return data.map(d => ({ id: d.id }))
}

type Props = { params: Params }

export default async function ChapterID({ params: { id } }: Props) {
  let post = (await getSortedContentData('Blog')).find(d => d.id === id)!
  return <Post id={id} post={post} />
}
