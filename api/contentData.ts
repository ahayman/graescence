import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { StaticParam } from '../lib/types'
import { remark } from 'remark'
import HTML from 'remark-html'
import remarkGfm from 'remark-gfm'
import { Feed, Item } from 'feed'
import { parseISO } from 'date-fns'
import { isNotEmpty } from '../lib/utils'

//Must match the actual content directory name
export type ContentType = 'updates' | 'chapters' | 'lore'
const contentDir = path.join(process.cwd(), 'content')
const contentTypeDir = (type: ContentType) => path.join(contentDir, type)
const excerpt_separator = '<-- excerpt -->'
const notes_separator = '<-- note -->'

const VolumeNames: { [key: number]: string | undefined } = {}
const Cache: { [key in ContentType]: ContentData[key][] | undefined } = {
  updates: undefined,
  chapters: undefined,
  lore: undefined,
}

/**
 * The definition of content includes the type of content along with the data.
 */
export type ContentDefinition<Type extends ContentType, Data extends {}> = { [key in Type]: Data }

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
  highlightedHtml: string
}

export type PostMeta = Meta & {
  type: 'post'
  excerpt: string
}

/**
 * The data associated with a Blog Post/Update
 */
export type PostData = PostMeta & {
  html: string
}

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
export type LoreData = LoreMeta & {
  excerpt: string
  html: string
}

/**
 * Content Data is a union type that represents Updates, Chapters,
 * and Lore.
 */
type ContentData = ContentDefinition<'updates', PostData> &
  ContentDefinition<'chapters', ChapterData> &
  ContentDefinition<'lore', LoreData>

/// Metadat common to all Content
export type Meta = ContentId & {
  title: string
  date: string
}

/// Content ID for all content.
export type ContentId = {
  id: string
}

export type PageContent = 'home'

/**
 * The primary function to extract the content data from the front matter
 * @param type The type of data to extract from the front matter.
 * @param id  The id, usually derived from the filename. Needed to fill out the content data.
 * @param front  The front matter to extract data from.
 * @returns
 */
const extractData = async <T extends ContentType>(
  type: T,
  id: string,
  front: matter.GrayMatterFile<string>,
): Promise<ContentData[T] | undefined> => {
  const data = front.data
  const title = data.title
  const date = data.date.toString()

  if (!date || !title) {
    return undefined
  }

  switch (type as ContentType) {
    case 'chapters': {
      const volumeNo = Number.parseInt(data.volume)
      const chapterNo = Number.parseInt(data.chapter)
      const tagData = data.tags
      const tags = typeof tagData === 'string' ? tagData.split(/,\s*/) : []

      if (isNaN(volumeNo) || isNaN(chapterNo)) {
        return undefined
      }
      let volumeName = VolumeNames[volumeNo]
      if (!volumeName) {
        volumeName = data.volumeName
        VolumeNames[volumeNo] = volumeName
      }
      const parts = front.content.split(notes_separator)
      const [notesMd, contentMd] = parts.length >= 2 ? [parts[0], parts[1]] : [undefined, parts[0]]
      const processedContent = await remark().use(remarkGfm).use(HTML).process(contentMd.trim())
      const processedNotes = notesMd ? await remark().use(remarkGfm).use(HTML).process(notesMd.trim()) : undefined
      const html = processedContent.toString()
      const notes = processedNotes?.toString()
      const lore = Cache['lore'] ?? (await getSortedContentData('lore'))
      const { chapterLore, highlightedHtml } = parseHighlightedLore(html, lore)
      const extract: ContentData['chapters'] = {
        type: 'chapter',
        id,
        title,
        date,
        volumeNo,
        chapterNo,
        tags,
        html,
        volumeName,
        notes,
        highlightedHtml,
        lore: chapterLore,
      }
      return extract as ContentData[T]
    }
    case 'updates': {
      const excerpt = front.excerpt
        ? (await remark().use(remarkGfm).use(HTML).process(front.excerpt)).toString()
        : (await remark().use(remarkGfm).use(HTML).process(front.content.replace(excerpt_separator, ''))).toString()

      const processedContent = await remark()
        .use(remarkGfm)
        .use(HTML)
        .process(front.content.replace(excerpt_separator, ''))
      const html = processedContent.toString()
      const extract: ContentData['updates'] = { type: 'post', id, title, date, excerpt, html }
      return extract as ContentData[T]
    }
    case 'lore': {
      const category = data.category
      if (!category) {
        return undefined
      }
      const tags = typeof data.tags === 'string' ? data.tags.split(/,\s*/) : []
      const processedContent = await remark()
        .use(remarkGfm)
        .use(HTML)
        .process(front.content.replace(excerpt_separator, ''))
      const html = processedContent.toString()
      const excerpt = front.excerpt
        ? (await remark().use(remarkGfm).use(HTML).process(front.excerpt)).toString()
        : (await remark().use(remarkGfm).use(HTML).process(front.content.replace(excerpt_separator, ''))).toString()
      const extract: ContentData['lore'] = { type: 'lore', id, title, date, category, tags, html, excerpt }
      return extract as ContentData[T]
    }
  }
}

type ContentSortFn<T extends ContentType> = (l: ContentData[T], r: ContentData[T]) => number

/**
 * A sort function to sort content data. Sort order depends on the type
 * of data.
 */
const sortFn = <T extends ContentType>(type: T): ContentSortFn<T> => {
  if (type === 'chapters') {
    const sort: ContentSortFn<'chapters'> = (l, r) => {
      if (l.volumeNo === r.volumeNo) {
        return l.chapterNo - r.chapterNo
      } else {
        return l.volumeNo - r.volumeNo
      }
    }
    return sort as ContentSortFn<T>
  }
  if (type === 'lore') {
    const sort: ContentSortFn<'lore'> = (l, r) => {
      return l.title.localeCompare(r.title)
    }
    return sort as ContentSortFn<T>
  }

  return (l, r) => {
    if (l.date < r.date) {
      return 1
    } else {
      return -1
    }
  }
}

export const getContent = async (type: PageContent): Promise<string> => {
  switch (type) {
    case 'home': {
      const homePath = path.join(contentDir, 'home.md')
      const fileContents = fs.readFileSync(homePath, 'utf8')
      const processedContent = await remark().use(remarkGfm).use(HTML).process(fileContents)
      return processedContent.toString()
    }
  }
}

/**
 * Generates RSS data from the content, and then writes the
 * rss data to public/feeds folder.
 */
export const generateRSS = async (type: ContentType) => {
  const data = await getSortedContentData(type)
  const title = `${process.env.SITE_NAME ?? 'Graescence'} ${type.charAt(0).toUpperCase() + type.slice(1)} Feed`
  const siteUrl = process.env.HOST ?? 'http://localhost:3000'
  const date = new Date()
  const feed = new Feed({
    id: title,
    title,
    namespaces: [
      {
        name: 'xmlns:readform',
        link: 'https://readform.app/faq',
      },
    ],
    description: `RSS Feed of ${type} from the Graescence Webnovel`,
    copyright: `All rights reserved ${date.getFullYear()}, apotesanon`,
    link: siteUrl,
    updated: date,
    favicon: siteUrl + '/favicon.ico',
    image: siteUrl + '/images/profile.png',
    generator: 'Feed npm package',
    language: 'en',
    feedLinks: {
      rss2: `${siteUrl}/feeds/${type}/feed.xml`,
    },
    author: {
      name: 'apoetsanon',
    },
  })
  if (type === 'chapters') {
    feed.addExtension({
      name: 'readform:lore',
      objects: `${siteUrl}/feeds/lore/feed.xml`,
    })
  }
  feed.items = data.map(content => {
    const item: Item = {
      title: content.title,
      id: content.id,
      link: `${siteUrl}/${type}/${content.id}`,
      description: content.html,
      author: [{ name: 'apoetsanon' }],
      date: parseISO(content.date),
    }
    switch (content.type) {
      case 'lore':
      case 'chapter': {
        if (content.tags.length > 0) {
          item.extensions = [
            {
              name: 'readform:tags',
              objects: content.tags.join(','),
            },
          ]
        }
      }
    }
    return item
  })
  fs.mkdirSync(`./public/feeds/${type}`, { recursive: true })
  fs.writeFileSync(`./public/feeds/${type}/feed.xml`, feed.rss2())
}

/**
 * Retrieves content data from the provided directory, then recursively
 * retrieves additional content data from subfolders. If no directory is provided,
 * then the root directory for the specified type is used.
 */
export const getSortedContentData = async <T extends ContentType>(
  type: T,
  dir: string = contentTypeDir(type),
): Promise<ContentData[T][]> => {
  const cached = Cache[type]
  if (cached !== undefined) {
    return cached
  }

  //If we're retrieving chapter data, and Lore isn't cached, cache the lore first (it's needed for Chapter lore)
  if (type === 'chapters' && Cache['lore'] === undefined) {
    getSortedContentData('lore')
  }

  //Remove the rootDirectory and replace slashes with a dot to create a rootId
  const rootDir = contentTypeDir(type)
  const rootId =
    rootDir === dir
      ? ''
      : encodeURIComponent(
          dir
            .replace(rootDir + '/', '')
            .replace(' & ', '-')
            .replaceAll(' ', '_')
            .replaceAll('/', '.')
            .replaceAll('&', '-'),
        )
  const contents = fs.readdirSync(dir, { withFileTypes: true })
  const sort = sortFn(type)
  let data = (
    await Promise.all(
      contents.map(async file => {
        // Remove ".md" from file name to get id
        const fullPath = path.join(dir, file.name)
        if (file.isDirectory()) {
          return await getSortedContentData(type, fullPath)
        }
        if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
          return undefined
        }

        const fileId = encodeURIComponent(
          file.name
            .replace(/\.md|\.markdown$/, '')
            .replace(' & ', '-')
            .replaceAll(' ', '_')
            .replaceAll('&', '-'),
        )
        const id = [rootId, fileId].filter(i => !!i).join('.')
        const fileContents = fs.readFileSync(fullPath, 'utf8')

        // Use gray-matter to parse the post metadata section
        const result = matter(fileContents, { excerpt: true, excerpt_separator })
        return await extractData(type, id, result)
      }),
    )
  )
    .filter(isNotEmpty)
    .flatMap(i => i)
    .sort(sort)

  Cache[type] = data as any
  return data
}

export const getAllContentIds = async (type: ContentType): Promise<StaticParam<ContentId>[]> => {
  const data = await getSortedContentData(type)
  return data.map(({ id }) => {
    return { params: { id } }
  })
}

/**
 * Takes a chapter's html plus all LoreData and produces a highlighted html string (using class="loreHighlight")
 * and a subset of lore data that represents all lore within the chapter.
 */
const parseHighlightedLore = (
  chapterHtml: string,
  lore: LoreData[],
): { highlightedHtml: string; chapterLore: LoreData[] } => {
  const chapterLore: LoreData[] = []
  let highlightedHtml = chapterHtml
  for (const l of lore) {
    let add = false
    for (const tag of l.tags) {
      const re = new RegExp('\\b' + tag + '\\b', 'g')
      var indexes: number[] = []
      let match: RegExpExecArray | null = null
      while ((match = re.exec(highlightedHtml)) !== null) {
        indexes.unshift(match.index)
      }
      for (const idx of indexes) {
        add = true
        highlightedHtml =
          highlightedHtml.substring(0, idx) +
          '<span class="loreHighlight">' +
          tag +
          '</span>' +
          highlightedHtml.substring(idx + tag.length)
      }
    }
    if (add) {
      chapterLore.push(l)
    }
  }
  return { highlightedHtml, chapterLore }
}
