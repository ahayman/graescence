import { useMemo } from 'react'
import { ChapterMeta } from '../../api/types'

export type ChapterData = {
  byID: { [key: string]: number }
  byTag: { [key: string]: number[] }
  byVolume: { [key: number]: number[] }
  volumeName: { [key: number]: string | undefined }
  items: ChapterMeta[]
}

export const useStructuredChapterData = (items: ChapterMeta[]): ChapterData => {
  return useMemo(() => {
    const byID: { [key: string]: number } = {}
    const byVolume: { [key: string]: number[] } = {}
    const byTag: { [key: string]: number[] } = {}
    const volumeName: { [key: number]: string | undefined } = {}
    items.forEach((chapter, index) => {
      // Set Chapter id data
      byID[chapter.id] = index

      if (!volumeName[chapter.volumeNo] && chapter.volumeName) {
        volumeName[chapter.volumeNo] = chapter.volumeName
      }

      // Set Chapter Volumes
      if (!byVolume[chapter.volumeNo]) {
        byVolume[chapter.volumeNo] = []
      }
      byVolume[chapter.volumeNo]?.push(index)

      //Set Chapter Tags
      for (const tag of chapter.tags) {
        if (!byTag[tag]) {
          byTag[tag] = []
        }
        byTag[tag]?.push(index)
      }
    })
    return { byID, byVolume, byTag, items, volumeName }
  }, [items])
}
