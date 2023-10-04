import { generateRSS, getSortedContentData, LoreData } from '../../../api/contentData'
import Lore from './lore'

export type Params = {
  id: string
}

export async function generateStaticParams(): Promise<Params[]> {
  generateRSS('lore')
  const data = await getSortedContentData('lore')
  return data.map(d => ({ id: d.id }))
}

type Props = {
  params: Params
}

export default async function PageData({ params: { id } }: Props) {
  const lore = (await getSortedContentData('lore')).find(l => l.id === id)
  return <Lore id={id} lore={lore!} />
}
