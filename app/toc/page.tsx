'use client'
import utilStyles from '../../styles/utils.module.scss'
import Date from '../../components/date'
import Link from 'next/link'
import { classes } from '../../lib/utils'
import { useContext } from 'react'
import { ContentContext } from '../../contexts/Content/Provider'

const TOC = () => {
  const { chapters } = useContext(ContentContext)
  return (
    <>
      <section className={`${utilStyles.headingMid} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        {chapters && chapters?.length > 0 ? (
          <ul className={utilStyles.list}>
            {chapters.map(({ id, date, title, chapterNo }) => (
              <li className={utilStyles.listItem} key={id}>
                <Link className={classes(utilStyles.row, utilStyles.justifyBetween)} href={`/chapters/${id}`}>
                  <h4>{`${chapterNo} | ${title}`}</h4>
                  {date && (
                    <div className={[utilStyles.lightText, utilStyles.smallText].join(' ')}>
                      <Date dateString={date} />
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div>No Chapters Exist</div>
        )}
      </section>
    </>
  )
}
export default TOC
