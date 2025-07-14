'use client'
import Date from '../../date'
import utilStyles from '../../../styles/utils.module.scss'
import postStyles from '../../../styles/post.module.scss'
import Row from '../../Row'
import ContentBlock from '../../ContentBlock/ContentBlock'
import Header from '../../Header/Header'
import ReadingOptions from '../../ReadingOptions/ReadingOptions'
import { HistoryData, HistoryMeta } from '../../../staticGenerator/types'
import { faSliders } from '@fortawesome/free-solid-svg-icons'
import Popover from '../../Popover/Popover'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useContext, useMemo } from 'react'
import { useCategoricalFilter } from '../../../hooks/useCategoricalFilter'
import { ContentContext } from '../../../providers/Content/Provider'
import { includeHistoryItem } from './utils/includeHistoryItem'
import { getSortedHistoryData, SortDirection } from './utils/sortedHistoryData'
import { useQueryParams } from '../../../hooks/useQueryParams'
import Tags from '../../Tags/Tags'
import { classes } from '../../../lib/utils'

export type Props = {
  id: string
  item: HistoryData
}

type QueryParam = 'sort' | 'filter' | 'tag'

const History = ({ item }: Props) => {
  const { title, date, html, category, startDate, endDate, turning } = item
  const [params] = useQueryParams<QueryParam>()
  const nav = useRouter()
  const tag = params['tag']
  const paramFilter = params['filter']
  const sort: SortDirection = params['sort'] === 'ascending' ? 'ascending' : 'descending'
  const { history } = useContext(ContentContext)
  const { data } = useCategoricalFilter(history, includeHistoryItem, paramFilter, tag)

  const [prev, next] = useMemo((): [HistoryMeta | undefined, HistoryMeta | undefined] => {
    const sorted = getSortedHistoryData(data, sort).flatMap(d => d.data)
    const idx = sorted.findIndex(d => d.id === item.id)
    const next = sorted[idx + 1]
    const prev = idx > 0 ? sorted[idx - 1] : undefined
    return [prev, next]
  }, [data, item.id, sort])

  return (
    <div className={utilStyles.pageMain}>
      <Header type="Primary">
        <Row horizontal="space-between" vertical="center">
          <Row style={{ gap: 10 }}>
            {title} {turning && <Tags tags={[turning]} />}
          </Row>
          <Popover icon={faSliders} name="ReadingOptions">
            <ReadingOptions />
          </Popover>
        </Row>
      </Header>
      <Header type="Secondary">
        <Row horizontal="space-between" vertical="center">
          <Row vertical="center" style={{ gap: 5 }}>
            <span>{category}</span>
            <span className={classes(utilStyles.smallText, utilStyles.lightText)}>{`(${startDate} → ${endDate})`}</span>
          </Row>
          <span className={classes(utilStyles.smallText, utilStyles.lightText)}>
            {date && <Date dateString={date} />}
          </span>
        </Row>
      </Header>
      <ContentBlock>
        <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: html }} />
      </ContentBlock>
      <Row horizontal="space-between" vertical="center" className={utilStyles.hPadding}>
        {prev ? (
          <Link className={utilStyles.coloredLink} href={`/history/${prev.id}`}>
            {`← ${prev.title}`}
          </Link>
        ) : (
          <span className={utilStyles.coloredLink} onClick={nav.back}>
            {'← To History'}
          </span>
        )}
        {next && (
          <Link className={utilStyles.coloredLink} href={`/history/${next.id}`}>
            {`${next.title} →`}
          </Link>
        )}
      </Row>
    </div>
  )
}
export default History
