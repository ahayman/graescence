import { getSortedContentData, LoreExcerpt } from '../../api/contentData'
import LoreHub from './LoreHub'

export default async function PageData() {
  const data: LoreExcerpt[] = (await getSortedContentData('lore')).map(
    ({ id, title, date, tags, category, excerpt }) => ({ id, title, date, tags, category, excerpt }),
  )
  return <LoreHub loreData={data} />
}
