import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { StaticParam } from '../lib/types'
import { remark } from 'remark'
import HTML from 'remark-html'
import { Feed } from 'feed'
import { parseISO } from 'date-fns'
import { isNotEmpty } from '../lib/utils'

//Must match the actual content directory name
export type ContentType = 'updates' | 'chapters' | 'lore'

const contentDir = (type: ContentType) => path.join(process.cwd(), `content/${type}`)
const excerpt_separator = '<-- excerpt -->'

const VolumeNames: { [key: number]: string | undefined } = {}
const Cache: { [key in ContentType]: ContentData[key][] | undefined } = {
  updates: undefined,
  chapters: undefined,
  lore: undefined,
}

export type ContentDefinition<Type extends ContentType, Data extends {}> = { [key in Type]: Data }

export type ChapterData = Meta & {
  volumeNo: number
  volumeName?: string
  chapterNo: number
  tags: string[]
  html: string
}

export type PostData = Meta & {
  excerpt: string
  html: string
}

export type LoreData = Meta & {
  category: string
  tags: string[]
  excerpt: string
  html: string
}

type ContentData = ContentDefinition<'updates', PostData> &
  ContentDefinition<'chapters', ChapterData> &
  ContentDefinition<'lore', LoreData>

export type Meta = ContentId & {
  title: string
  date: string
}

export type ContentId = {
  id: string
}

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
      const processedContent = await remark().use(HTML).process(front.content)
      const html = processedContent.toString()
      const extract: ContentData['chapters'] = { id, title, date, volumeNo, chapterNo, tags, html, volumeName }
      return extract as ContentData[T]
    }
    case 'updates': {
      const excerpt = front.excerpt
        ? (await remark().use(HTML).process(front.excerpt)).toString()
        : (await remark().use(HTML).process(front.content.replace(excerpt_separator, ''))).toString()

      const processedContent = await remark().use(HTML).process(front.content.replace(excerpt_separator, ''))
      const html = processedContent.toString()
      const extract: ContentData['updates'] = { id, title, date, excerpt, html }
      return extract as ContentData[T]
    }
    case 'lore': {
      const category = data.category
      if (!category) {
        return undefined
      }
      const tags = typeof data.tags === 'string' ? data.tags.split(/,\s*/) : []
      const processedContent = await remark().use(HTML).process(front.content.replace(excerpt_separator, ''))
      const html = processedContent.toString()
      const excerpt = front.excerpt
        ? (await remark().use(HTML).process(front.excerpt)).toString()
        : (await remark().use(HTML).process(front.content.replace(excerpt_separator, ''))).toString()
      const extract: ContentData['lore'] = { id, title, date, category, tags, html, excerpt }
      return extract as ContentData[T]
    }
  }
}

type ContentSortFn<T extends ContentType> = (l: ContentData[T], r: ContentData[T]) => number

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

export const generateRSS = async (type: ContentType) => {
  const data = await getSortedContentData(type)
  const title = `${process.env.SITE_NAME ?? 'Graescence'} ${type.charAt(0).toUpperCase() + type.slice(1)} Feed`
  const siteUrl = process.env.HOST ?? 'http://localhost:3000'
  const date = new Date()
  const feed = new Feed({
    id: title,
    title,
    description: `RSS Feed of ${type} from the Graescence Webnovel`,
    copyright: `All rights reserved ${date.getFullYear()}, apotesanon`,
    updated: date,
    favicon: siteUrl + '/favicon.ico',
    image: siteUrl + '/images/profile.png',
    generator: 'Feed npm package',
    language: 'en',
    feedLinks: {
      rss2: `${siteUrl}/feeds/${type}/feed.xml`,
      json: `${siteUrl}/feeds/${type}/feed.json`,
      atom: `${siteUrl}/feeds/${type}/atom.xml`,
    },
    author: {
      name: 'apoetsanon',
    },
  })
  feed.items = data.map(content => ({
    title: content.title,
    id: content.id,
    link: `${siteUrl}/${type}/${content.id}`,
    description: content.html,
    author: [{ name: 'apoetsanon' }],
    date: parseISO(content.date),
  }))
  fs.mkdirSync(`./public/feeds/${type}`, { recursive: true })
  fs.writeFileSync(`./public/feeds/${type}/feed.xml`, feed.rss2())
  fs.writeFileSync(`./public/feeds/${type}/atom.xml`, feed.atom1())
  fs.writeFileSync(`./public/feeds/${type}/feed.json`, feed.json1())
}

export const getSortedContentData = async <T extends ContentType>(
  type: T,
  dir: string = contentDir(type),
): Promise<ContentData[T][]> => {
  const cached = Cache[type]
  if (cached !== undefined) {
    return cached
  }
  //Remove the rootDirectory and replace slashes with a dot to create a rootId
  const rootDir = contentDir(type)
  const rootId =
    rootDir === dir
      ? ''
      : encodeURIComponent(
          dir
            .replace(rootDir + '/', '')
            .replaceAll(' ', '_')
            .replaceAll('/', '.'),
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

        const fileId = encodeURIComponent(file.name.replace(/\.md|\.markdown$/, '').replaceAll(' ', '_'))
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
