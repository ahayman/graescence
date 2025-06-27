import Link from 'next/link'
import Row from '../../components/Row'
import styles from './ExcerptItem.module.scss'
import postStyles from '../../styles/post.module.scss'
import utilStyles from '../../styles/utils.module.scss'
import Header from '../../components/Header/Header'
import Date from '../../components/date'

export type Props = {
  type: 'lore' | 'history' | 'blog'
  id: string
  title: string
  date: string
  excerpt: string
}
export const ExcerptItem = ({ type, id, title, date, excerpt }: Props) => (
  <div className={styles.container}>
    <Link href={`/${type}/${id}`}>
      <Row className={styles.headerRow} horizontal="space-between" vertical="center">
        <Header type="Tertiary" title={title} />
        <span className={styles.date}>
          <Date dateString={date} />
        </span>
      </Row>
    </Link>
    <div className={styles.excerpt}>
      <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: excerpt }} />
      <Row horizontal="end">
        <Link className={utilStyles.coloredLink} href={`/${type}/${id}`}>
          More →
        </Link>
      </Row>
    </div>
  </div>
)
