/** Major types of content displayed on the website. */
export type ContentType = 'Blog' | 'Chapters' | 'Lore' | 'History'

/// Content ID for all content.
export type ContentId = {
  id: string
}

/// Metadata common to all Content
export type Meta = ContentId & {
  title: string
  date: string
}

/** === CHATPER === */

/**
 * Meta associated with a chapter (missing content)
 */
export type ChapterMeta = Meta & {
  volumeNo: number
  volumeName?: string
  chapterNo: number
  tags: string[]
}

/**
 * All data associated with a Chapter
 */
export type ChapterData = ChapterMeta & {
  type: 'chapter'
  notes?: string
  html: string
  lore: LoreData[]
}

/** === POST === */

export type BlogMeta = Meta & {
  type: 'blog'
  excerpt: string
}

/**
 * The data associated with a Blog Post/Update
 */
export type BlogData = BlogMeta & {
  html: string
}

/** === LORE === */

/**
 * Lore Metatdata includes everything except lore content.
 */
export type LoreMeta = Meta & {
  type: 'lore'
  category: string
  tags: string[]
}

export type LoreExcerpt = LoreMeta & {
  excerpt: string
}

/**
 * The data associated with Lore (meta + content)
 */
export type LoreData = LoreExcerpt & {
  html: string
}

/** === HISTORY === */

export type HistoryMeta = Meta & {
  type: 'history'
  category: string
  startDate: string
  endDate: string
  turning?: string
  tags: string[]
}

export type HistoryExcerpt = HistoryMeta & {
  excerpt: string
}

export type HistoryData = HistoryExcerpt & {
  html: string
}
