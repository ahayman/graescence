'use client'
import utilStyles from '../../styles/utils.module.scss'
import Date from '../../components/date'
import Link from 'next/link'
import { useContext } from 'react'
import { ContentContext } from '../../contexts/Content/Provider'

const Updates = () => {
  const { posts } = useContext(ContentContext)
  return (
    <>
      <section
        className={utilStyles.smallText}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10 }}>
        <p>Initial Next site that may or may not be destined to become my web novel blog.</p>
        <hr
          style={{ borderColor: 'lightGray', marginLeft: 30, marginTop: 10, marginRight: 30, alignSelf: 'stretch' }}
        />
      </section>
      <section className={`${utilStyles.headingMid} ${utilStyles.padding1px}`}>
        <h2 className={utilStyles.headingLg}>Blog</h2>
        {posts.length > 0 && (
          <ul className={utilStyles.list}>
            {posts.map(({ id, date, title, excerpt }) => (
              <li className={utilStyles.listItem} key={id}>
                <>
                  <hr />
                  <br />
                  <Link href={`/posts/${id}`}>
                    <h4>{title}</h4>
                    <br />
                    <div className={[utilStyles.lightText, utilStyles.smallText].join(' ')}>
                      <Date dateString={date} />
                    </div>
                    {excerpt && <div dangerouslySetInnerHTML={{ __html: excerpt }} />}
                  </Link>
                </>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
export default Updates
