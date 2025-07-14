import { LoreExcerpt } from '../../../staticGenerator/types'
import Column from '../../../components/Column'
import { ExcerptItem } from '../../../components/ExcerptItem/ExcerptItem'
import Header from '../../../components/Header/Header'
import styles from './chapter.module.scss'

export type Props = {
  data: LoreExcerpt[]
}
const ChapterLore = ({ data }: Props) => (
  <>
    <Header type="Primary" title="Lore" />
    <Column className={styles.loreContainer}>
      {data.map(item => (
        <ExcerptItem key={item.id} {...item} />
      ))}
    </Column>
  </>
)
export default ChapterLore
