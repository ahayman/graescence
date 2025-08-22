'use client'
import Date from '../../date'
import utilStyles from '../../../styles/utils.module.scss'
import Row from '../../Row'
import Tags from '../../Tags/Tags'
import Header from '../../Header/Header'
import ReadingOptions from '../../ReadingOptions/ReadingOptions'
import { LoreData } from '../../../staticGenerator/types'
import { faSliders } from '@fortawesome/free-solid-svg-icons'
import Popover from '../../Popover/Popover'
import { useRouter } from 'next/navigation'
import { Reader } from '../../Reader/Reader'

export type Props = {
  id: string
  lore: LoreData
}

const Lore = ({ lore }: Props) => {
  const { title, publishedDate, tags, category } = lore
  const nav = useRouter()

  return (
    <div className={utilStyles.pageMain}>
      <Header type="Primary">
        <Row horizontal="space-between" vertical="center">
          <Row gap={10}>
            {title}
            {tags.length > 0 && <Tags tags={tags} />}
          </Row>
          <Popover icon={faSliders} name="ReadingOptions">
            <ReadingOptions />
          </Popover>
        </Row>
      </Header>
      <Header type="Secondary">
        <Row horizontal="space-between" vertical="center">
          <span>{category}</span>
          <span className={utilStyles.smallText}>{publishedDate && <Date dateString={publishedDate} />}</span>
        </Row>
      </Header>
      <Reader {...lore} tier="world" nav={{ prev: { title: 'Back', onClick: nav.back } }} />
    </div>
  )
}
export default Lore
