'use client'
import Date from '../../date'
import utilStyles from '../../../styles/utils.module.scss'
import Row from '../../Row'
import Header from '../../Header/Header'
import ReadingOptions from '../../ReadingOptions/ReadingOptions'
import { HistoryData } from '../../../staticGenerator/types'
import { faSliders } from '@fortawesome/free-solid-svg-icons'
import Popover from '../../Popover/Popover'
import { useRouter } from 'next/navigation'
import { useContext, useMemo } from 'react'
import { useCategoricalFilter } from '../../../hooks/useCategoricalFilter'
import { ContentContext } from '../../../providers/Content/Provider'
import { includeHistoryItem } from './utils/includeHistoryItem'
import { getSortedHistoryData, SortDirection } from './utils/sortedHistoryData'
import { useQueryParams } from '../../../hooks/useQueryParams'
import Tags from '../../Tags/Tags'
import { classes } from '../../../lib/utils'
import { NavLink, Reader } from '../../Reader/Reader'

export type Props = {
  id: string
  item: HistoryData
}

type QueryParam = 'sort' | 'filter' | 'tag'

const History = ({ item }: Props) => {
  const { title, date, category, startDate, endDate, turning } = item
  const [params] = useQueryParams<QueryParam>()
  const nav = useRouter()
  const tag = params['tag']
  const paramFilter = params['filter']
  const sort: SortDirection = params['sort'] === 'ascending' ? 'ascending' : 'descending'
  const { history } = useContext(ContentContext)
  const { data } = useCategoricalFilter(history, includeHistoryItem, paramFilter, tag)

  const [prev, next] = useMemo((): [NavLink | undefined, NavLink | undefined] => {
    const sorted = getSortedHistoryData(data, sort).flatMap(d => d.data)
    const idx = sorted.findIndex(d => d.id === item.id)
    const nextLore = sorted[idx + 1]
    const prevLore = idx > 0 ? sorted[idx - 1] : undefined
    const next = nextLore ? { title: nextLore.title, url: `/history/${nextLore.id}` } : undefined
    const prev = prevLore
      ? { title: prevLore.title, url: `/history/${prevLore.id}` }
      : { title: 'Back', onClick: nav.back }
    return [prev, next]
  }, [data, item.id, nav.back, sort])

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
      <Reader {...item} tier="world" nav={{ prev, next }} />
    </div>
  )
}
export default History
