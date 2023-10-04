import { createContext, ReactNode, useMemo } from 'react'
import { ChapterMeta, LoreMeta, PostMeta } from '../../api/contentData'
import { Chapters, Lore, State } from './Types'

export const ContentContext = createContext<State>({} as any)

export type Props = {
  children: ReactNode
  updates: PostMeta[]
  chapters: ChapterMeta[]
  lore: LoreMeta[]
  home: string
}

const ContentProvider = ({ children, updates, chapters, lore, home }: Props) => {
  const loreData = useMemo(() => extractLoreFromData(lore), [lore])
  const chapterData = useMemo(() => extractChaptersFromData(chapters), [chapters])
  return (
    <ContentContext.Provider
      value={{
        lore: loreData,
        chapters: chapterData,
        updates,
        home,
      }}>
      {children}
    </ContentContext.Provider>
  )
}
export default ContentProvider

const extractChaptersFromData = (items: ChapterMeta[]): Chapters => {
  const byID: { [key: string]: number } = {}
  const byVolume: { [key: string]: number[] } = {}
  const byTag: { [key: string]: number[] } = {}
  const volumeName: { [key: number]: string | undefined } = {}
  items.forEach((chapter, index) => {
    // Set Chapter id data
    byID[chapter.id] = index

    if (!volumeName[chapter.volumeNo] && chapter.volumeName) {
      volumeName[chapter.volumeNo] = chapter.volumeName
    }

    // Set Chapter Volumes
    if (!byVolume[chapter.volumeNo]) {
      byVolume[chapter.volumeNo] = []
    }
    byVolume[chapter.volumeNo]?.push(index)

    //Set Chapter Tags
    for (const tag of chapter.tags) {
      if (!byTag[tag]) {
        byTag[tag] = []
      }
      byTag[tag]?.push(index)
    }
  })
  return { byID, byVolume, byTag, items, volumeName }
}

const extractLoreFromData = (items: LoreMeta[]): Lore => {
  const byID: { [key: string]: number } = {}
  const byCategory: { [key: string]: number[] } = {}
  const byTag: { [key: string]: number[] } = {}
  items.forEach((lore, index) => {
    //Set Lore id
    byID[lore.id] = index

    //Set Category
    if (!byCategory[lore.category]) {
      byCategory[lore.category] = []
    }
    byCategory[lore.category]?.push(index)

    //Set Chapter Tags
    for (const tag in lore.tags) {
      if (!byTag[tag]) {
        byTag[tag] = []
      }
      byTag[tag]?.push(index)
    }
  })

  return { byID, byCategory, byTag, items }
}
