import { ChapterData, PostData, LoreData } from '../../api/contentData'

export type Lore = {
  byID: { [key: string]: number }
  byCategory: { [key: string]: number[] }
  byTag: { [key: string]: number[] }
  items: LoreData[]
}

export type Chapters = {
  byID: { [key: string]: number }
  byTag: { [key: string]: number[] }
  byVolume: { [key: number]: number[] }
  volumeName: { [key: number]: string | undefined }
  items: ChapterData[]
}

export type State = {
  updates: PostData[]
  chapters: Chapters
  lore: Lore
}
