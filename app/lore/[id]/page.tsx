import { generateRSS, getSortedContentData, LoreData } from '../../../api/contentData'
import Lore from './lore'

export type Params = {
  id: string
}

export async function generateStaticParams(): Promise<Params[]> {
  generateRSS('Lore')
  const data = await getSortedContentData('Lore')
  return data.map(d => ({ id: d.id }))
}

type Props = {
  params: Params
}

export default async function PageData({ params: { id } }: Props) {
  const lore = (await getSortedContentData('Lore')).find(l => l.id === id)
  return <Lore id={id} lore={lore!} />
}
