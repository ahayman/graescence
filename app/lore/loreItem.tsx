import Link from 'next/link'
import { LoreExcerpt } from '../../api/contentData'
import ContentBlock from '../../components/ContentBlock/ContentBlock'
import Row from '../../components/Row'
import Tags from '../../components/Tags/Tags'
import styles from './lore.module.scss'
import postStyles from '../../styles/post.module.scss'
import utilStyles from '../../styles/utils.module.scss'
import Header from '../../components/Header/Header'
import Date from '../../components/date'

export type Props = {
  lore: LoreExcerpt
}
const LoreItem = ({ lore }: Props) => (
  <>
    <Link href={`/lore/${lore.id}`}>
      <Row className={styles.headerRow} horizontal="space-between" vertical="center">
        <Header type="Tertiary" title={lore.title} />
        <span className={styles.date}>
          <Date dateString={lore.date} />
        </span>
      </Row>
    </Link>
    <ContentBlock key={lore.id}>
      <div className={styles.tagsRow}>
        <Tags tags={lore.tags} />
      </div>
      <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: lore.excerpt }} />
      <Row horizontal="end">
        <Link className={utilStyles.coloredLink} href={`/lore/${lore.id}`}>
          {'More →'}
        </Link>
      </Row>
    </ContentBlock>
  </>
)
export default LoreItem
