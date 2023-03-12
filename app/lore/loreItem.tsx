import Link from 'next/link'
import { LoreData } from '../../api/contentData'
import ContentBlock from '../../components/ContentBlock/ContentBlock'
import Row from '../../components/Row'
import Tags from '../../components/Tags/Tags'
import styles from './lore.module.scss'
import postStyles from '../../styles/post.module.scss'
import utilStyles from '../../styles/utils.module.scss'

export type Props = {
  lore: LoreData
}
const LoreItem = ({ lore }: Props) => (
  <ContentBlock key={lore.id}>
    <Link href={`/lore/${lore.id}`}>
      <h4>{lore.title}</h4>
    </Link>
    <div className={styles.tagsRow}>
      <Tags tags={lore.tags} />
    </div>
    <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: lore.excerpt }} />
    {lore.excerpt.length < lore.html.length && (
      <Row horizontal="end">
        <Link className={utilStyles.coloredLink} href={`/lore/${lore.id}`}>
          {'More →'}
        </Link>
      </Row>
    )}
  </ContentBlock>
)
export default LoreItem
