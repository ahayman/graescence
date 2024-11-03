import { getSortedContentData, LoreExcerpt } from '../../../api/contentData'
import LoreHub from '../LoreHub'

export default async function PageData() {
  const data: LoreExcerpt[] = (await getSortedContentData('Lore')).map(
    ({ type, id, title, date, tags, category, excerpt }) => ({ type, id, title, date, tags, category, excerpt }),
  )
  return <LoreHub loreData={data} showLatest />
}
