'use client'
import utilStyles from '../../../styles/utils.module.scss'
import postStyles from '../../../styles/post.module.scss'
import s from './Home.module.scss'
import Link from 'next/link'
import { classes } from '../../../lib/utils'
import { useContext, useMemo } from 'react'
import { ContentContext } from '../../../providers/Content/Provider'
import Column from '../../Column'
import { ProgressContext } from '../../../providers/Progress/Provider'
import Image from 'next/image'
import Row from '../../Row'

export interface Props {
  content: string
}

export const Home = ({ content }: Props) => {
  const { chapters, blog } = useContext(ContentContext)
  const {
    state: { currentChapter: chapterProgress },
  } = useContext(ProgressContext)
  const currentChapter = useMemo(
    () => chapters.find(c => c.uuid === chapterProgress?.id) ?? chapters[0],
    [chapters, chapterProgress],
  )
  const firstChapter = chapters[0]
  const latestChapter = chapters[chapters.length - 1]
  const latestPost = blog[0]

  const renderInfoBlock = (header: string, title: string, link: string) => (
    <Link href={link} className={classes(s.infoBlock, utilStyles.scaleHover)}>
      <div className={s.infoHeader}>{header}</div>
      <div className={s.infoData}>{title}</div>
    </Link>
  )

  return (
    <Column>
      <div className={s.infoContainer}>
        {currentChapter
          ? renderInfoBlock('Continue', currentChapter.title, `/chapters/${currentChapter.id}`)
          : renderInfoBlock('Begin', firstChapter.title, `/chapters/${firstChapter.id}`)}
        {latestChapter &&
          latestChapter !== currentChapter &&
          renderInfoBlock('Latest', latestChapter.title, `/chapters/${latestChapter.id}`)}
        {latestPost && renderInfoBlock('Blog', latestPost.title, `/blog/${latestPost.id}`)}
      </div>
      <Row horizontal="center">
        <Image
          className={utilStyles.roundedCorners}
          src="/images/GraescenceCover.png"
          alt="Cover Artwork"
          layout="responsive"
          style={{ minWidth: 150, maxWidth: 400 }}
          width={400}
          height={533.2}
        />
      </Row>
      <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: content }} />
    </Column>
  )
}
