'use client'
import { ChapterData, PostData, LoreData } from '../api/contentData'
import { ReactNode } from 'react'
import ContentProvider from '../providers/Content/Provider'
import OptionsProvider from '../providers/Options/Provider'
import ProgressProvider from '../providers/Progress/Provider'
import DisplayProvider from '../providers/Display/Provider'

export type Props = {
  children: ReactNode
  content: {
    updates: PostData[]
    chapters: ChapterData[]
    lore: LoreData[]
  }
}

const Providers = ({ children, content: { updates, chapters, lore } }: Props) => {
  return (
    <OptionsProvider>
      <ContentProvider updates={updates} chapters={chapters} lore={lore}>
        <DisplayProvider>
          <ProgressProvider>{children}</ProgressProvider>
        </DisplayProvider>
      </ContentProvider>
    </OptionsProvider>
  )
}
export default Providers
