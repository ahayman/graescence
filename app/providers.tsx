'use client'
import { ChapterData } from '../api/chapters'
import { ReactNode } from 'react'
import { PostData } from '../api/posts'
import ContentProvider from '../contexts/Content/Provider'
import OptionsProvider from '../contexts/Options/Provider'

export type Props = {
  children: ReactNode
  content: {
    posts: PostData[]
    chapters: ChapterData[]
  }
}

const Providers = ({ children, content }: Props) => {
  return (
    <OptionsProvider>
      <ContentProvider value={content}>{children}</ContentProvider>
    </OptionsProvider>
  )
}
export default Providers
