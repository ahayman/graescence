import { LoreExcerpt } from '../../../staticGenerator/types'
import Column from '../../Column'
import { ExcerptItem } from '../../ExcerptItem/ExcerptItem'
import Header from '../../Header/Header'
import styles from './chapter.module.scss'

export type Props = {
  data: LoreExcerpt[]
}
const ChapterLore = ({ data }: Props) => (
  <>
    <Header type="Primary" title="Lore" />
    <Column className={styles.loreContainer}>
      {data.map(item => (
        <ExcerptItem tier="world" key={item.id} {...item} />
      ))}
    </Column>
  </>
)
export default ChapterLore
