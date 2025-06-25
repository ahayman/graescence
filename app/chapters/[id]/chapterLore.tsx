import { LoreExcerpt } from '../../../api/types'
import Header from '../../../components/Header/Header'
import LoreItem from '../../lore/loreItem'
import styles from './chapter.module.scss'

export type Props = {
  data: LoreExcerpt[]
}
const ChapterLore = ({ data }: Props) => (
  <>
    <Header type="Primary" title="Lore" />
    <div className={styles.loreContainer}>
      {data.map(item => (
        <LoreItem key={item.id} lore={item} />
      ))}
    </div>
  </>
)
export default ChapterLore
