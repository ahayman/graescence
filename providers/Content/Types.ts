import { LoreMeta, ChapterMeta, Meta } from '../../api/contentData'

export type Lore = {
  byID: { [key: string]: number }
  byCategory: { [key: string]: number[] }
  byTag: { [key: string]: number[] }
  items: LoreMeta[]
}

export type Chapters = {
  byID: { [key: string]: number }
  byTag: { [key: string]: number[] }
  byVolume: { [key: number]: number[] }
  volumeName: { [key: number]: string | undefined }
  items: ChapterMeta[]
}

export type State = {
  updates: Meta[]
  chapters: Chapters
  lore: Lore
}
