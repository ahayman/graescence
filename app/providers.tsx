'use client'
import { PostMeta, ChapterMeta, LoreMeta } from '../api/contentData'
import { ReactNode } from 'react'
import ContentProvider from '../providers/Content/Provider'
import OptionsProvider from '../providers/Options/Provider'
import ProgressProvider from '../providers/Progress/Provider'
import DisplayProvider from '../providers/Display/Provider'

export type Props = {
  children: ReactNode
  content: {
    updates: PostMeta[]
    chapters: ChapterMeta[]
    lore: LoreMeta[]
    home: string
  }
}

const Providers = ({ children, content: { updates, chapters, lore, home } }: Props) => {
  return (
    <OptionsProvider>
      <ContentProvider updates={updates} chapters={chapters} lore={lore} home={home}>
        <DisplayProvider>
          <ProgressProvider>{children}</ProgressProvider>
        </DisplayProvider>
      </ContentProvider>
    </OptionsProvider>
  )
}
export default Providers
