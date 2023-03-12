import { useMemo } from 'react'
import { ChapterData, LoreData } from '../../../../api/contentData'

export const useChapterLore = (chapter: ChapterData, lore: LoreData[]): ChapterData =>
  useMemo(() => {
    const chapterLore: LoreData[] = []
    let html = chapter.html
    for (const l of lore) {
      let add = false
      for (const tag of l.tags) {
        console.log('Tag: ', tag)
        const re = new RegExp('\\b' + tag + '\\b', 'g')
        var indexes: number[] = []
        let match: RegExpExecArray | null = null
        while ((match = re.exec(html)) !== null) {
          console.log('Match index: ', match.index)
          indexes.unshift(match.index)
        }
        for (const idx of indexes) {
          add = true
          html =
            html.substring(0, idx) + '<span class="loreHighlight">' + tag + '</span>' + html.substring(idx + tag.length)
        }
      }
      if (add) {
        chapterLore.push(l)
      }
    }
    return { ...chapter, highlightedHtml: html, lore: chapterLore }
  }, [chapter, lore])
