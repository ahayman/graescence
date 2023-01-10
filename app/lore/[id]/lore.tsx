'use client'
import Date from '../../../components/date'
import utilStyles from '../../../styles/utils.module.scss'
import postStyles from '../../../styles/post.module.scss'
import Row from '../../../components/Row'
import { useContext } from 'react'
import { ContentContext } from '../../../providers/Content/Provider'
import ContentBlock from '../../../components/ContentBlock/ContentBlock'
import Tags from '../../../components/Tags/Tags'
import Header from '../../../components/Header/Header'

export type Props = {
  id: string
}

const Lore = ({ id }: Props) => {
  const { lore } = useContext(ContentContext)
  const loreItem = lore.items[lore.byID[id]]
  if (!loreItem) {
    return <div> No Chapter Found!</div>
  }
  const { title, date, html, tags, category } = loreItem
  return (
    <>
      <Header title={title} type="Primary" />
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
