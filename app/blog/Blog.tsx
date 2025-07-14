'use client'
import utilStyles from '../../styles/utils.module.scss'
import Column from '../../components/Column'
import Header from '../../components/Header/Header'
import { BlogMeta } from '../../staticGenerator/types'
import { ExcerptItem } from '../../components/ExcerptItem/ExcerptItem'

export interface Props {
  blog: BlogMeta[]
}

const Blog = ({ blog }: Props) => (
  <Column className={`${utilStyles.headingMd} ${utilStyles.padding1px}`}>
    <Header type="Primary" title="Updates" />
    {blog.map(item => (
      <ExcerptItem key={item.id} {...item} />
    ))}
  </Column>
)
export default Blog
