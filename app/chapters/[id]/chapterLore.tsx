import { LoreData } from '../../../api/contentData'
import Header from '../../../components/Header/Header'
import LoreItem from '../../lore/loreItem'

export type Props = {
  data: LoreData[]
}
const ChapterLore = ({ data }: Props) => (
  <>
    <Header type="Primary" title="Lore" />
    {data.map(item => (
      <LoreItem key={item.id} lore={item} />
    ))}
  </>
)
export default ChapterLore
