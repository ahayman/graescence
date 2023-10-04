'use client'
import Date from '../../../components/date'
import utilStyles from '../../../styles/utils.module.scss'
import postStyles from '../../../styles/post.module.scss'
import Row from '../../../components/Row'
import ContentBlock from '../../../components/ContentBlock/ContentBlock'
import Tags from '../../../components/Tags/Tags'
import Header from '../../../components/Header/Header'
import ReadingOptions from '../../../components/ReadingOptions/ReadingOptions'
import { LoreData } from '../../../api/contentData'

export type Props = {
  id: string
  lore: LoreData
}

const Lore = ({ lore }: Props) => {
  const { title, date, html, tags, category } = lore
  return (
    <>
      <Header type="Primary">
        <Row horizontal="space-between" vertical="center">
          {title}
          <ReadingOptions />
        </Row>
      </Header>
      <Header type="Secondary">
        <Row horizontal="space-between" vertical="center">
          <span>{category}</span>
          <span className={utilStyles.smallText}>{date && <Date dateString={date} />}</span>
        </Row>
      </Header>
      <ContentBlock>
        {tags.length > 0 && <Tags tags={tags} />}
        <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: html }} />
      </ContentBlock>
    </>
  )
}
export default Lore
