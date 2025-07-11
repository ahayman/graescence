import Link from 'next/link'
import Row from '../../components/Row'
import styles from './ExcerptItem.module.scss'
import postStyles from '../../styles/post.module.scss'
import utilStyles from '../../styles/utils.module.scss'
import Header from '../../components/Header/Header'
import Date from '../../components/date'
import { createURL } from '../../app/history/utils/createURL'

export type Props = {
  type: 'lore' | 'history' | 'blog'
  id: string
  title: string
  date: string
  excerpt: string
  passThroughQuery?: URLSearchParams | Record<string, string | undefined>
}
export const ExcerptItem = ({ type, id, title, date, excerpt, passThroughQuery }: Props) => (
  <div className={styles.container}>
    <Link href={createURL(`/${type}/${id}`, passThroughQuery)}>
      <Row className={styles.headerRow} horizontal="space-between" vertical="center">
        <Header scaleHover type="Tertiary" title={title} />
        <span className={styles.date}>
          <Date dateString={date} />
        </span>
      </Row>
    </Link>
    <div className={styles.excerpt}>
      <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: excerpt }} />
      <Row horizontal="end">
        <Link className={utilStyles.coloredLink} href={createURL(`/${type}/${id}`, passThroughQuery)}>
          <span>More →</span>
        </Link>
      </Row>
    </div>
  </div>
)
