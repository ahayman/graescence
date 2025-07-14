import { LoreExcerpt } from '../../staticGenerator/types'
import { getSortedContentData } from '../../staticGenerator/contentData'
import LoreHub from '../../components/Pages/Lore/LoreHub'

export default async function PageData() {
  const data: LoreExcerpt[] = (await getSortedContentData('Lore')).map(
    ({ type, id, title, date, tags, category, excerpt }) => ({ type, id, title, date, tags, category, excerpt }),
  )
  return <LoreHub loreData={data} />
}
