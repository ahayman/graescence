'use client'
import utilStyles from '../../../styles/utils.module.scss'
import Column from '../../Column'
import Header from '../../Header/Header'
import { BlogMeta } from '../../../staticGenerator/types'
import { ExcerptItem } from '../../ExcerptItem/ExcerptItem'

export interface Props {
  blog: BlogMeta[]
}

const Blog = ({ blog }: Props) => (
  <Column className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
    <Header type="Primary" title="Updates" />
    {blog.map(item => (
      <ExcerptItem tier="free" key={item.slug} {...item} date={item.publicDate} />
    ))}
  </Column>
)
export default Blog
