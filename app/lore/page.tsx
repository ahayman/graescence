import { LoreExcerpt } from '../../staticGenerator/types'
import { getSortedContentData } from '../../staticGenerator/contentData'
import LoreHub from '../../components/Pages/Lore/LoreHub'

export default async function PageData() {
  const data: LoreExcerpt[] = (await getSortedContentData('Lore')).map(
    ({ type, uuid, slug, title, publishedDate, tags, category, excerpt, publicDate, thumbnail }) => ({
      type,
      uuid,
      slug,
      title,
      publishedDate,
      tags,
      category,
      excerpt,
      publicDate,
      thumbnail,
    }),
  )
  return <LoreHub loreData={data} />
}
