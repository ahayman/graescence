import Head from 'next/head'
import Layout, { siteTitle } from '../components/layout'
import utilStyles from '../styles/utils.module.css'
import { getSortedPostsData, PostMeta } from '../lib/posts'
import { StaticProps } from '../lib/types'
import Date from '../components/date'
import Link from 'next/link'

export type Props = {
  postData?: PostMeta[]
}

const Home = ({ postData }: Props) => (
  <Layout home>
    <Head>
      <title>{siteTitle}</title>
    </Head>
    <section
      className={utilStyles.smallText}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10 }}>
      <p>Initial Next site that may or may not be destined to become my web novel blog.</p>
      <hr style={{ borderColor: 'lightGray', marginLeft: 30, marginTop: 10, marginRight: 30, alignSelf: 'stretch' }} />
    </section>
    <section className={`${utilStyles.headingMid} ${utilStyles.padding1px}`}>
      <h2 className={utilStyles.headingLg}>Blog</h2>
      {postData && (
        <ul className={utilStyles.list}>
          {postData.map(({ id, date, title }) => (
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
                </Link>
              </>
            </li>
          ))}
        </ul>
      )}
    </section>
  </Layout>
)
export default Home

export const getStaticProps = (): StaticProps<Props> => {
  const postData = getSortedPostsData()
  return {
    props: {
      postData,
    },
  }
}
