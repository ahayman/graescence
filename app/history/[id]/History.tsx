'use client'
import Date from '../../../components/date'
import utilStyles from '../../../styles/utils.module.scss'
import postStyles from '../../../styles/post.module.scss'
import Row from '../../../components/Row'
import ContentBlock from '../../../components/ContentBlock/ContentBlock'
import Header from '../../../components/Header/Header'
import ReadingOptions from '../../../components/ReadingOptions/ReadingOptions'
import { HistoryData, HistoryMeta } from '../../../api/types'
import { faSliders } from '@fortawesome/free-solid-svg-icons'
import Popover from '../../../components/Popover/Popover'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useContext, useMemo } from 'react'
import { useCategoricalFilter } from '../../../hooks/useCategoricalFilter'
import { DisplayContext } from '../../../providers/Display/Provider'
import { ContentContext } from '../../../providers/Content/Provider'
import { includeHistoryItem } from '../utils/includeHistoryItem'
import { getSortedHistoryData } from '../utils/sortedHistoryData'

export type Props = {
  id: string
  item: HistoryData
}

const Lore = ({ item }: Props) => {
  const { title, date, html, category } = item
  const nav = useRouter()
  const {
    state: { historyCategory, historyFilter, historySortDirection },
  } = useContext(DisplayContext)
  const { history } = useContext(ContentContext)
  const { data } = useCategoricalFilter(history, includeHistoryItem, historyFilter, historyCategory)

  const [prev, next] = useMemo((): [HistoryMeta | undefined, HistoryMeta | undefined] => {
    const sorted = getSortedHistoryData(data, historySortDirection).flatMap(d => d.data)
    const idx = sorted.findIndex(d => d.id === item.id)
    const next = sorted[idx + 1]
    const prev = idx > 0 ? sorted[idx - 1] : undefined
    return [prev, next]
  }, [data, historySortDirection, item])

  return (
    <>
      <Header type="Primary" sticky>
        <Row horizontal="space-between" vertical="center">
          {title}
          <Popover icon={faSliders} name="ReadingOptions">
            <ReadingOptions />
          </Popover>
        </Row>
      </Header>
      <Header type="Secondary">
        <Row horizontal="space-between" vertical="center">
          <span>{category}</span>
          <span className={utilStyles.smallText}>{date && <Date dateString={date} />}</span>
        </Row>
      </Header>
      <ContentBlock>
        <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: html }} />
        <Row horizontal="space-between" vertical="center">
          {prev ? (
            <Link className={utilStyles.coloredLink} href={`/history/${prev.id}`}>
              {`← ${prev.title}`}
            </Link>
          ) : (
            <span className={utilStyles.coloredLink} onClick={nav.back}>
              {'← Back to History'}
            </span>
          )}
          {next && (
            <Link className={utilStyles.coloredLink} href={`/history/${next.id}`}>
              {`${next.title} →`}
            </Link>
          )}
        </Row>
      </ContentBlock>
    </>
  )
}
export default Lore
