import { useCallback, useMemo, useState } from 'react'

type AllTag = 'All'
const allTag: AllTag = 'All'
type Tag = AllTag | string

export type AllTags = [AllTag, ...string[]]

export type Data<T> = {
  tagFiltered: T[]
  selectedTag: Tag
  tags: AllTags
  onSelectTag: (tag: Tag) => void
}

export const useTagSelect = <T>(data: T[], tags: string[], tagForData: (data: T) => string[]): Data<T> => {
  const [selectedTag, selectTag] = useState<Tag>('All')
  const allTags: AllTags = useMemo(() => [allTag, ...tags], [tags])

  const onSelectTag = useCallback((tag: Tag) => {
    selectTag(tag)
  }, [])

  const filtered = useMemo(() => {
    return selectedTag === allTag ? data : data.filter(d => tagForData(d).includes(selectedTag))
  }, [data, tagForData, selectedTag])

  return { tagFiltered: filtered, selectedTag, tags: allTags, onSelectTag }
}
