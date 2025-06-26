import { ChapterMeta, Meta, HistoryMeta, LoreMeta } from '../../api/types'

export type State = {
  blog: Meta[]
  chapters: ChapterMeta[]
  lore: LoreMeta[]
  history: HistoryMeta[]
}
