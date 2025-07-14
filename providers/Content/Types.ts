import { ChapterMeta, Meta, HistoryMeta, LoreMeta } from '../../staticGenerator/types'

export type State = {
  blog: Meta[]
  chapters: ChapterMeta[]
  lore: LoreMeta[]
  history: HistoryMeta[]
}
