import fs from 'fs'
import { Feed } from 'feed'
import path from 'path'
import matter, { language } from 'gray-matter'
import { StaticParam } from '../lib/types'
import { remark } from 'remark'
import html from 'remark-html'
import { isNotEmpty } from '../lib/utils'
import { parseISO } from 'date-fns'

const chaptersDirectory = path.join(process.cwd(), 'chapters')
const markdownExt = /\.md|\.markdown$/

type Meta = {
  title: string
  volumeNo: number
  chapterNo: number
  tags: string[]
  date: string
}

export type ChapterMeta = Meta & {
  id: string
}

export type ChapterID = {
  id: string
}

export const generateRSS = () => {
  const data = getSortedChapterMeta()
  const title = `${process.env.SITE_NAME ?? 'Graescence'} Chapter Feed`
  const siteUrl = process.env.HOST ?? 'http://localhost:3000'
  const date = new Date()
  const feed = new Feed({
    id: title,
    title,
    description: 'Complete list of Chapters for the Graescence web novel',
    copyright: `All rights reserved ${date.getFullYear()}, apotesanon`,
    updated: date,
    favicon: siteUrl + '/favicon.ico',
    image: siteUrl + '/images/profile.png',
    generator: 'Feed npm package',
    language: 'en',
    feedLinks: {
      rss2: `${siteUrl}/feeds/toc/feed.xml`,
      json: `${siteUrl}/feeds/toc/feed.json`,
      atom: `${siteUrl}/feeds/toc/atom.xml`,
    },
    author: {
      name: 'apoetsanon',
    },
  })
  feed.items = data.map(chapter => ({
    title: `Chapter ${chapter.chapterNo} ${chapter.title}`,
    id: `v${chapter.volumeNo}.c${chapter.chapterNo}.${chapter.id}`,
    link: `${siteUrl}/chapters/${chapter.id}`,
    description: chapter.title,
    content: chapter.title,
    author: [{ name: 'apoetsanon' }],
    date: parseISO(chapter.date),
  }))
  fs.mkdirSync('./public/feeds/toc', { recursive: true })
  fs.writeFileSync('./public/feeds/toc/feed.xml', feed.rss2())
  fs.writeFileSync('./public/feeds/toc/atom.xml', feed.atom1())
  fs.writeFileSync('./public/feeds/toc/feed.json', feed.json1())
}

const chapterMetaFromMatter = (result: matter.GrayMatterFile<string>): Meta | undefined => {
  const frontMatter = result.data
  const title = frontMatter.title
  const date = frontMatter.date.toString()
  const volumeNo = Number.parseInt(frontMatter.volume)
  const chapterNo = Number.parseInt(frontMatter.chapter)
  const tagData = frontMatter.tags
  const tags = typeof tagData === 'string' ? tagData.split(/,\s*/) : []

  if (isNaN(volumeNo) || isNaN(chapterNo) || !date) {
    return undefined
  }

  return {
    title,
    date,
    volumeNo,
    chapterNo,
    tags,
  }
}

export const getSortedChapterMeta = (): ChapterMeta[] => {
  // Get file names under /posts
  const fileNames = fs.readdirSync(chaptersDirectory)
  const allPostsData: ChapterMeta[] = fileNames
    .map(name => {
      const id = name.replace(markdownExt, '')

      // Read markdown file as string
      const fullPath = path.join(chaptersDirectory, name)
      const fileContents = fs.readFileSync(fullPath, 'utf8')

      // Use gray-matter to parse the post metadata section
      const matterResult = matter(fileContents)
      let meta = chapterMetaFromMatter(matterResult)
      if (!meta) {
        return undefined
      }

      return { id, ...meta }
    })
    .filter(isNotEmpty)
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.volumeNo === b.volumeNo) {
      return a.chapterNo - b.chapterNo
    } else {
      return a.volumeNo - b.volumeNo
    }
  })
}

export const getSortedChapterData = async (): Promise<ChapterData[]> => {
  // Get file names under /posts
  const fileNames = fs.readdirSync(chaptersDirectory)
  const allPostsData: ChapterData[] = (
    await Promise.all(
      fileNames.map(async name => {
        const id = name.replace(markdownExt, '')

        // Read markdown file as string
        const fullPath = path.join(chaptersDirectory, name)
        const fileContents = fs.readFileSync(fullPath, 'utf8')

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents)
        let meta = chapterMetaFromMatter(matterResult)
        if (!meta) {
          return undefined
        }

        const processedContent = await remark().use(html).process(matterResult.content)
        const contentHtml = processedContent.toString()
        return {
          id,
          ...meta,
          html: contentHtml,
        }
      }),
    )
  ).filter(isNotEmpty)
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.volumeNo === b.volumeNo) {
      return a.chapterNo - b.chapterNo
    } else {
      return a.volumeNo - b.volumeNo
    }
  })
}

export const getAllChapterIds = (): StaticParam<ChapterID>[] => {
  const fileNames = fs.readdirSync(chaptersDirectory)
  return fileNames.map(name => {
    const id = name.replace(markdownExt, '')
    return {
      params: {
        id,
      },
    }
  })
}

export type ChapterData = ChapterMeta & {
  html: string
}

export const getChapterData = async (id: string): Promise<ChapterData> => {
  let fullPath = path.join(chaptersDirectory, `${id}.md`)
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(chaptersDirectory, `${id}.markdown`)
  }
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)
  const meta: Meta = chapterMetaFromMatter(matterResult) || {
    title: '',
    date: '',
    volumeNo: 0,
    chapterNo: 0,
    tags: [],
  }

  // Use remark to convert markdown into HTML string
  const processedContent = await remark().use(html).process(matterResult.content)
  const contentHtml = processedContent.toString()

  // Combine the data with the id
  return {
    ...meta,
    id,
    html: contentHtml,
  }
}
