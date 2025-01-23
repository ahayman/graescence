'use client'
import postStyles from '../../styles/post.module.scss'
import ContentBlock from '../../components/ContentBlock/ContentBlock'
import Header from '../../components/Header/Header'

export interface Props {
  title: string
  content: string
}

export const StandardPage = ({ content, title }: Props) => {
  return (
    <>
      <Header type="Primary" title={title} />
      <ContentBlock>
        <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: content }} />
      </ContentBlock>
    </>
  )
}
