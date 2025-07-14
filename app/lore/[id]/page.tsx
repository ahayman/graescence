import { generateRSS, getSortedContentData } from '../../../api/contentData'
import Lore from './lore'

export type Params = {
  id: string
}

export async function generateStaticParams(): Promise<Params[]> {
  generateRSS('Lore')
  const data = await getSortedContentData('Lore')
  return data.map(d => ({ id: encodeURIComponent(d.id) }))
}

type Props = {
  params: Promise<Params>
}

export default async function PageData({ params }: Props) {
  const id = (await params).id
  const lore = (await getSortedContentData('Lore')).find(l => l.id === decodeURIComponent(id))
  if (!lore) return <span>Invalid Lore ID</span>
  return <Lore id={id} lore={lore} />
}
