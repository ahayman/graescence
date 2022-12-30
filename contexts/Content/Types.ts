import { ChapterData } from '../../api/chapters'
import { PostData } from '../../api/posts'

export type State = {
  posts: PostData[]
  chapters: ChapterData[]
}
