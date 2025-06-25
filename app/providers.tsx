'use client'
import { Meta, ChapterMeta, LoreMeta, HistoryMeta } from '../api/types'
import { ReactNode } from 'react'
import ContentProvider from '../providers/Content/Provider'
import OptionsProvider from '../providers/Options/Provider'
import ProgressProvider from '../providers/Progress/Provider'
import DisplayProvider from '../providers/Display/Provider'

export type Props = {
  children: ReactNode
  content: {
    blog: Meta[]
    chapters: ChapterMeta[]
    lore: LoreMeta[]
    history: HistoryMeta[]
  }
}

const Providers = ({ children, content: { blog, chapters, lore, history } }: Props) => {
  return (
    <OptionsProvider>
      <ContentProvider blog={blog} chapters={chapters} lore={lore} history={history}>
        <DisplayProvider>
          <ProgressProvider>{children}</ProgressProvider>
        </DisplayProvider>
      </ContentProvider>
    </OptionsProvider>
  )
}
export default Providers
