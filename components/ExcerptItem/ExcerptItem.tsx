import Link from 'next/link'
import Row from '../../components/Row'
import styles from './ExcerptItem.module.scss'
import postStyles from '../../styles/post.module.scss'
import utilStyles from '../../styles/utils.module.scss'
import Header from '../../components/Header/Header'
import Date from '../../components/date'
import Tags from '../Tags/Tags'
import { createURL } from '../Pages/History/utils/createURL'

export type Props = {
  type: 'lore' | 'history' | 'blog'
  id: string
  title: string
  excerpt: string
  date?: string
  subTitle?: string
  tags?: string[]
  passThroughQuery?: URLSearchParams | Record<string, string | undefined>
}
export const ExcerptItem = ({ type, id, title, date, excerpt, passThroughQuery, tags, subTitle }: Props) => (
  <div className={styles.container}>
    <Link href={createURL(`/${type}/${id}`, passThroughQuery)}>
      <Row className={styles.headerRow} horizontal="space-between" vertical="center">
        <Row style={{ gap: 5 }}>
          <Header scaleHover type="Tertiary" title={title} />
          {tags && <Tags tags={tags} type="secondary" />}
        </Row>
        {subTitle && <span className={styles.subTitle}>{subTitle}</span>}
        {date && (
          <span className={styles.date}>
            <Date dateString={date} />
          </span>
        )}
      </Row>
    </Link>
    <div className={styles.excerpt}>
      <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: excerpt }} />
      <Row horizontal="end" vertical="center">
        <Link className={utilStyles.coloredLink} href={createURL(`/${type}/${id}`, passThroughQuery)}>
          <span>More →</span>
        </Link>
      </Row>
    </div>
  </div>
)
