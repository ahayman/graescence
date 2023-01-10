'use client'
import utilStyles from '../../styles/utils.module.scss'
import Date from '../../components/date'
import Link from 'next/link'
import postStyles from '../../styles/post.module.scss'
import { useContext } from 'react'
import { ContentContext } from '../../providers/Content/Provider'
import Column from '../../components/Column'
import Header from '../../components/Header/Header'
import ContentBlock from '../../components/ContentBlock/ContentBlock'
import Row from '../../components/Row'
import { classes } from '../../lib/utils'

const Updates = () => {
  const { updates } = useContext(ContentContext)
  return (
    <>
      <Column className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
        <Header type="Primary" title="Updates" />
        {updates.map(({ id, date, title, excerpt, html }) => (
          <Link href={`/updates/${id}`} key={id}>
            <Header type="Secondary">
              <Row horizontal="space-between" vertical="center">
                <span>{title}</span>
                <span className={classes(utilStyles.lightText, utilStyles.smallText)}>
                  <Date dateString={date} />
                </span>
              </Row>
            </Header>
            <ContentBlock key={id}>
              <div className={[utilStyles.lightText, utilStyles.smallText].join(' ')}></div>
              {excerpt && <div className={postStyles.post} dangerouslySetInnerHTML={{ __html: excerpt }} />}
              {excerpt.length < html.length && (
                <Row horizontal="end">
                  <Link className={utilStyles.coloredLink} href={`/updates/${id}`}>
                    {'More →'}
                  </Link>
                </Row>
              )}
            </ContentBlock>
          </Link>
        ))}
      </Column>
    </>
  )
}
export default Updates
