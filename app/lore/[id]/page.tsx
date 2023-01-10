import { getAllContentIds, generateRSS } from '../../../api/contentData'
import Lore from './lore'

export type Params = {
  id: string
}

export async function generateStaticParams(): Promise<Params[]> {
  generateRSS('lore')
  const ids = await getAllContentIds('lore')
  return ids.map(p => ({ id: p.params.id }))
}

type Props = {
  params: Params
}

export default function ChapterID({ params: { id } }: Props) {
  return <Lore id={id} />
}
