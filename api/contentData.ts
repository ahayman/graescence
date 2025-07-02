import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { StaticParam } from '../lib/types'
import { remark } from 'remark'
import HTML from 'remark-html'
import remarkGfm from 'remark-gfm'
import { Extension, Feed, Item } from 'feed'
import { parseISO } from 'date-fns'
import { isNotEmpty } from '../lib/utils'
import { ChapterData, ContentId, ContentType, HistoryData, LoreData, BlogData } from './types'

//Must match the actual content directory name
const contentDir = path.join(process.cwd(), 'content')
const contentTypeDir = (type: ContentType) => path.join(contentDir, type)
const excerpt_separator = '<-- excerpt -->'
const notes_separator = '<-- note -->'

const VolumeNames: { [key: number]: string | undefined } = {}
const Cache: { [key in ContentType]: ContentData[key][] | undefined } = {
  Blog: undefined,
  Chapters: undefined,
  Lore: undefined,
  History: undefined,
}
const Paths: { [k: string]: string } = {}
const PathIds: { [k: string]: string } = {}
const SanitizedPaths: { [k: string]: string } = {}

const addPath = (id: string, path: string) => {
  if (!path.startsWith('/')) {
    path = '/' + path
  }
  Paths[id.toLocaleLowerCase()] = path
  PathIds[path.toLocaleLowerCase()] = id
  SanitizedPaths[path.replace('.', '/').toLocaleLowerCase()] = path
}

const getPath = (idOrPath: string): string | undefined => {
  let key = idOrPath.toLocaleLowerCase()
  let path = Paths[key]
  if (path) return path
  // key is a path, so we need to sanitize it
  if (!idOrPath.startsWith('/')) {
    key = `/${key}`.replaceAll(' ', '_')
  }

  path = SanitizedPaths[key]

  if (!path || !PathIds[path.toLocaleLowerCase()]) {
    return undefined
  }
  return path
}

/**
 * The definition of content includes the type of content along with the data.
 */
export type ContentDefinition<Type extends ContentType, Data extends {}> = { [key in Type]: Data }

/**
 * Content Data is a union type that represents Blog, Chapters,
 * and Lore.
 */
type ContentData = ContentDefinition<'Blog', BlogData> &
  ContentDefinition<'Chapters', ChapterData> &
  ContentDefinition<'Lore', LoreData> &
  ContentDefinition<'History', HistoryData>

export type PageContent = 'Home'

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
  fileName: string,
  parent: string,
  front: matter.GrayMatterFile<string>,
): Promise<ContentData[T] | undefined> => {
  const data = front.data
  const title = data.title
  const date = data.date instanceof Date ? data.date.toISOString() : data.date?.toString()
  const published = data.published

  if (!date || !title || !published) {
    return undefined
  }

  switch (type as ContentType) {
    case 'Chapters': {
      const volumeNo = Number.parseInt(parent.split(' ')[1].split(' - ')[0])
      const chapterNo = Number.parseInt(fileName.split(' ')[0])
      const tagData = data.tags
      const tags: string[] = (
        (typeof tagData === 'string' ? tagData.split(/,\s*/) : tagData instanceof Array ? tagData : []) as string[]
      ).map(t => t.replaceAll('_', ' '))

      if (isNaN(volumeNo) || isNaN(chapterNo)) {
        return undefined
      }
      let volumeName = VolumeNames[volumeNo]
      if (!volumeName) {
        volumeName = parent.split(' - ')[1]
        VolumeNames[volumeNo] = volumeName
      }
      const parts = front.content.split(notes_separator)
      const [notesMd, contentMd] = parts.length >= 2 ? [parts[0], parts[1]] : [undefined, parts[0]]
      const processedContent = await remark().use(remarkGfm).use(HTML).process(contentMd.trim())
      const processedNotes = notesMd ? await remark().use(remarkGfm).use(HTML).process(notesMd.trim()) : undefined
      const html = processedContent.toString()
      const notes = processedNotes?.toString()
      const lore = Cache['Lore'] ?? (await getSortedContentData('Lore'))
      const { chapterLore, highlightedHtml } = parseHighlightedLore(html, lore)
      const extract: ContentData['Chapters'] = {
        type: 'chapter',
        id,
        title,
        date,
        volumeNo,
        chapterNo,
        tags,
        html: highlightedHtml,
        volumeName,
        notes,
        lore: chapterLore,
      }
      return extract as ContentData[T]
    }
    case 'Blog': {
      const excerpt = await getExcerpt(front)
      const processedContent = await remark()
        .use(remarkGfm)
        .use(HTML)
        .process(front.content.replace(excerpt_separator, ''))
      const html = processedContent.toString()
      const extract: ContentData['Blog'] = { type: 'blog', id, title, date, excerpt, html }
      return extract as ContentData[T]
    }
    case 'History': {
      const tagData = data.tags
      const startDate = data.startDate instanceof Date ? data.startDate.toISOString() : data.startDate?.toString()
      const endDate = data.endDate instanceof Date ? data.endDate.toISOString() : data.endDate?.toString()
      const tags: string[] = (
        (typeof tagData === 'string' ? tagData.split(/,\s*/) : tagData instanceof Array ? tagData : []) as string[]
      ).map(t => t.replaceAll('_', ' '))
      const processedContent = await remark()
        .use(remarkGfm)
        .use(HTML)
        .process(front.content.replace(excerpt_separator, ''))

      const html = processedContent.toString()
      const excerpt = await getExcerpt(front)
      const extract: ContentData['History'] = {
        type: 'history',
        id,
        title,
        date,
        startDate,
        endDate,
        category: parent,
        tags,
        html,
        excerpt,
      }
      return extract as ContentData[T]
    }
    case 'Lore': {
      const tagData = data.tags
      const tags: string[] = (
        (typeof tagData === 'string' ? tagData.split(/,\s*/) : tagData instanceof Array ? tagData : []) as string[]
      ).map(t => t.replaceAll('_', ' '))
      const processedContent = await remark()
        .use(remarkGfm)
        .use(HTML)
        .process(front.content.replace(excerpt_separator, ''))

      const html = processedContent.toString()
      const excerpt = await getExcerpt(front)
      const extract: ContentData['Lore'] = { type: 'lore', id, title, date, category: parent, tags, html, excerpt }
      return extract as ContentData[T]
    }
  }
}

const getExcerpt = async (front: matter.GrayMatterFile<string>): Promise<string> => {
  if (front.excerpt) return (await remark().use(remarkGfm).use(HTML).process(front.excerpt)).toString()

  // If no excerpt is provided, use the first paragraph of the content as the excerpt
  const paragraphs = front.content.replace(excerpt_separator, '').split('\n')
  const excerpt = paragraphs.find(p => p.trim().length > 0) || front.content
  return (await remark().use(remarkGfm).use(HTML).process(excerpt)).toString()
}

type ContentSortFn<T extends ContentType> = (l: ContentData[T], r: ContentData[T]) => number

/**
 * A sort function to sort content data. Sort order depends on the type
 * of data.
 */
const sortFn = <T extends ContentType>(type: T): ContentSortFn<T> => {
  if (type === 'Chapters') {
    const sort: ContentSortFn<'Chapters'> = (l, r) => {
      if (l.volumeNo === r.volumeNo) {
        return l.chapterNo - r.chapterNo
      } else {
        return l.volumeNo - r.volumeNo
      }
    }
    return sort as ContentSortFn<T>
  }
  if (type === 'Lore') {
    const sort: ContentSortFn<'Lore'> = (l, r) => {
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
  const homePath = path.join(contentDir, `Pages/${type}.md`)
  const fileContents = fs.readFileSync(homePath, 'utf8')
  await generateAllPaths()
  const processedContent = await remark().use(remarkGfm).use(HTML).process(fileContents)
  return processObsidianLinks(processedContent.toString())
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
  if (type === 'Chapters') {
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
    let extensions: Extension[] = []
    switch (content.type) {
      case 'lore':
      case 'chapter': {
        if (content.tags.length > 0) {
          extensions.push({
            name: 'readform:tags',
            objects: content.tags.join(','),
          })
        }
        if (content.type == 'chapter' && content.notes !== undefined) {
          extensions.push({
            name: 'readform:notes',
            objects: { _cdata: content.notes },
          })
        }
      }
    }
    item.extensions = extensions
    return item
  })
  fs.mkdirSync(`./public/feeds/${type}`, { recursive: true })
  fs.writeFileSync(`./public/feeds/${type}/feed.xml`, feed.rss2())
}

const generateAllPaths = async () => {
  addPath('Home', '/')
  await generatePathsIn('Lore')
  await generatePathsIn('Blog')
  await generatePathsIn('Chapters')
}

const generatePathsIn = async <T extends ContentType>(type: T, dir: string = contentTypeDir(type)): Promise<void> => {
  //Remove the rootDirectory and replace slashes with a dot to create a rootId
  const rootDir = contentTypeDir(type)
  const rootId =
    rootDir === dir
      ? ''
      : dir
          .replace(rootDir + '/', '')
          .replace(' & ', '-')
          .replaceAll(' ', '_')
          .replaceAll('/', '.')
          .replaceAll('&', '-')
          .replaceAll('|', '-')
  const contents = fs.readdirSync(dir, { withFileTypes: true })
  for (const file of contents) {
    // Remove ".md" from file name to get id
    const fullPath = path.join(dir, file.name)
    if (file.isDirectory()) {
      return await generatePathsIn(type, fullPath)
    }
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      return undefined
    }

    const fileId = file.name
      .replace(/\.md|\.markdown$/, '')
      .replace(' & ', '-')
      .replaceAll(' ', '_')
      .replaceAll('&', '-')
      .replaceAll('|', '-')
    const id = [rootId, fileId].filter(i => !!i).join('.')
    const fileName = file.name.replace(/\.md|\.markdown$/, '')
    addPath(fileName, `/${type.toLocaleLowerCase()}/${id}`)
  }
}

/**
 * Retrieves content data from the provided directory, then recursively
 * retrieves additional content data from subfolders. If no directory is provided,
 * then the root directory for the specified type is used.
 */
export const getSortedContentData = async <T extends ContentType>(
  type: T,
  dir: string = contentTypeDir(type),
  parent: string = 'root',
): Promise<ContentData[T][]> => {
  const cached = Cache[type]
  if (cached !== undefined) {
    return cached
  }

  //Always cache Lore first
  if (type !== 'Lore' && Cache['Lore'] === undefined) {
    getSortedContentData('Lore')
  }

  //Remove the rootDirectory and replace slashes with a dot to create a rootId
  const rootDir = contentTypeDir(type)
  const rootId =
    rootDir === dir
      ? ''
      : dir
          .replace(rootDir + '/', '')
          .replace(' & ', '-')
          .replaceAll(' ', '_')
          .replaceAll('/', '.')
          .replaceAll('&', '-')
          .replaceAll('|', '-')
  const contents = fs.readdirSync(dir, { withFileTypes: true })
  const sort = sortFn(type)
  let data = (
    await Promise.all(
      contents.map(async file => {
        // Remove ".md" from file name to get id
        const fullPath = path.join(dir, file.name)
        if (file.isDirectory()) {
          return await getSortedContentData(type, fullPath, file.name)
        }
        if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
          return undefined
        }

        const fileId = file.name
          .replace(/\.md|\.markdown$/, '')
          .replace(' & ', '-')
          .replaceAll(' ', '_')
          .replaceAll('&', '-')
          .replaceAll('|', '-')

        const id = [rootId, fileId].filter(i => !!i).join('.')
        const fileContents = fs.readFileSync(fullPath, 'utf8')

        // Use gray-matter to parse the post metadata section
        const result = matter(fileContents, { excerpt: true, excerpt_separator })
        const extracted = await extractData(type, id, file.name, parent, result)
        if (extracted) {
          const fileName = file.name.replace(/\.md|\.markdown$/, '')
          const path = `/${type.toLocaleLowerCase()}/${extracted.id}`
          addPath(fileName, path)
        }
        return extracted
      }),
    )
  )
    .filter(isNotEmpty)
    .flatMap(i => i)
    .sort(sort)

  //Process obsidian links
  if (['Lore', 'History', 'Blog'].includes(type)) {
    for (const l of data as ContentData['Lore' | 'History' | 'Blog'][]) {
      l.excerpt = processObsidianLinks(l.excerpt)
      l.html = processObsidianLinks(l.html)
    }
  }
  Cache[type] = data as any
  return data
}

export const getAllContentIds = async (type: ContentType): Promise<StaticParam<ContentId>[]> => {
  const data = await getSortedContentData(type)
  return data.map(({ id }) => {
    return { params: { id } }
  })
}

const processObsidianLinks = (content: string): string => {
  const re = new RegExp(/\[\[(.*?)\]\]/g)
  let found: RegExpExecArray[] = []
  let match: RegExpExecArray | null = null
  let processed = content
  while ((match = re.exec(processed)) !== null) {
    found.unshift(match)
  }
  for (const match of found) {
    const found = match[1]
    const matchLength = match[0].length
    if (!found) continue
    const parts = found.split('|')
    // If there are multiple `parts`, `part[0]` is the `path` and `part[1]` is the name.
    const path = getPath(parts.length > 1 ? parts[0] : found)
    let name = parts.length > 1 ? parts[1] : found
    if (path) {
      processed =
        processed.substring(0, match.index) +
        `<a class='inter_link' href="${path}">${name}</a>` +
        processed.substring(match.index + matchLength)
    } else {
      if (parts.length === 1 && name.includes('/')) {
        // if the name contains a slash, we assume it's a path want to grab the last part of the path
        const lastSlashIndex = name.lastIndexOf('/')
        if (lastSlashIndex !== -1) {
          name = name.substring(lastSlashIndex + 1)
        }
      }
      processed = processed.substring(0, match.index) + name + processed.substring(match.index + matchLength)
    }
  }
  return processed
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
          `<span class="loreHighlight">` +
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
