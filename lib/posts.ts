import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { StaticParam } from './types'
import { remark } from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts')

export type PostMeta = {
  id: string
  title: string
  date: string
}

export type PostID = {
  id: string
}

export const getSortedPostsData = () => {
  // Get file names under /posts
  const fileNames = fs.readdirSync(postsDirectory)
  const allPostsData: PostMeta[] = fileNames.map(fileName => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md|\.markdown$/, '')

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // Combine the data with the id
    return {
      id,
      title: matterResult.data['title'] ?? id,
      date: matterResult.data['date'] ?? 'No Date',
    }
  })
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
  content: string
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
  const processedContent = await remark().use(html).process(matterResult.content)
  const contentHtml = processedContent.toString()

  // Combine the data with the id
  return {
    id,
    title: matterResult.data['title'] ?? id,
    date: matterResult.data['date'] ?? 'No Date',
    content: matterResult.content,
    html: contentHtml,
  }
}
