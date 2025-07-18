import { BlogPost } from '../../../components/Pages/Blog/BlogPost'
import { generateRSS, getSortedContentData } from '../../../staticGenerator/contentData'

export type Params = { id: string }

export async function generateStaticParams(): Promise<Params[]> {
  await generateRSS('Blog')
  const data = await getSortedContentData('Blog')
  return data.map(d => ({ id: encodeURIComponent(d.slug) }))
}

type Props = { params: Promise<Params> }

export default async function Blog({ params }: Props) {
  const id = (await params).id
  let post = (await getSortedContentData('Blog')).find(d => d.slug === decodeURIComponent(id))
  if (!post) return null
  return <BlogPost id={id} post={post} />
}
