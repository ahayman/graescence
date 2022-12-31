import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { StaticParam } from '../lib/types'
import { remark } from 'remark'
import html from 'remark-html'
import { Feed } from 'feed'
import { parseISO } from 'date-fns'

const postsDirectory = path.join(process.cwd(), 'posts')
const excerpt_separator = '<-- excerpt -->'

export type PostMeta = {
  id: string
  title: string
  date: string
  excerpt?: string
}

export type PostID = {
  id: string
}

export const generateRSS = async () => {
  const data = await getSortedPostsData()
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
      rss2: `${siteUrl}/feeds/updates/feed.xml`,
      json: `${siteUrl}/feeds/updates/feed.json`,
      atom: `${siteUrl}/feeds/updates/atom.xml`,
    },
    author: {
      name: 'apoetsanon',
    },
  })
  feed.items = data.map(post => ({
    title: post.title,
    id: post.id,
    link: `${siteUrl}/posts/${post.id}`,
    description: post.html,
    author: [{ name: 'apoetsanon' }],
    date: parseISO(post.date),
  }))
  fs.mkdirSync('./public/feeds/updates', { recursive: true })
  fs.writeFileSync('./public/feeds/updates/feed.xml', feed.rss2())
  fs.writeFileSync('./public/feeds/updates/atom.xml', feed.atom1())
  fs.writeFileSync('./public/feeds/updates/feed.json', feed.json1())
}

export const getSortedPostsData = async (): Promise<PostData[]> => {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData: PostData[] = await Promise.all(
    fileNames.map(async fileName => {
      // Remove ".md" from file name to get id
      const id = fileName.replace(/\.md|\.markdown$/, '')

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')

      // Use gray-matter to parse the post metadata section
      const result = matter(fileContents, { excerpt: true, excerpt_separator })

      const excerpt = result.excerpt
        ? (await remark().use(html).process(result.excerpt)).toString()
        : (await remark().use(html).process(result.content.replace(excerpt_separator, ''))).toString()

      const processedContent = await remark().use(html).process(result.content.replace(excerpt_separator, ''))
      const contentHtml = processedContent.toString()

      // Combine the data with the id
      return {
        id,
        title: result.data['title'] ?? id,
        date: result.data['date'] ?? 'No Date',
        excerpt,
        html: contentHtml,
      }
    }),
  )
  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1
    } else {
      return -1
    }
  })
}

export const getAllPostIds = (): StaticParam<PostID>[] => {
  const fileNames = fs.readdirSync(postsDirectory)
  return fileNames.map(fileName => {
    return {
      params: {
        id: fileName.replace(/\.md|\.markdown$/, ''),
      },
    }
  })
}

export type PostData = PostMeta & {
  html: string
}

export const getPostData = async (id: string): Promise<PostData> => {
  let fullPath = path.join(postsDirectory, `${id}.md`)
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(postsDirectory, `${id}.markdown`)
  }
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents)

  // Use remark to convert markdown into HTML string
  const processedContent = await remark().use(html).process(matterResult.content.replace(excerpt_separator, ''))
  const contentHtml = processedContent.toString()

  // Combine the data with the id
  return {
    id,
    title: matterResult.data['title'] ?? id,
    date: matterResult.data['date'] ?? 'No Date',
    html: contentHtml,
  }
}
