import { LoreExcerpt } from '../../staticGenerator/types'
import { getSortedContentData } from '../../staticGenerator/contentData'
import LoreHub from '../../components/Pages/Lore/LoreHub'

export default async function PageData() {
  const data: LoreExcerpt[] = (await getSortedContentData('Lore')).map(
    ({ type, uuid, id, title, date, tags, category, excerpt, isPublic }) => ({
      type,
      uuid,
      id,
      title,
      date,
      tags,
      category,
      excerpt,
      isPublic,
    }),
  )
  return <LoreHub loreData={data} />
}
