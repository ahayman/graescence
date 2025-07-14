import { createContext, ReactNode } from 'react'
import { ChapterMeta, HistoryMeta, LoreMeta, Meta } from '../../staticGenerator/types'
import { State } from './Types'

export const ContentContext = createContext<State>({} as any)

export type Props = {
  children: ReactNode
  blog: Meta[]
  chapters: ChapterMeta[]
  lore: LoreMeta[]
  history: HistoryMeta[]
}

const ContentProvider = ({ children, blog, chapters, lore, history }: Props) => {
  return <ContentContext.Provider value={{ chapters, lore, history, blog }}>{children}</ContentContext.Provider>
}
export default ContentProvider
