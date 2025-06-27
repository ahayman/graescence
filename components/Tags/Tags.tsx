import { classes } from '../../lib/utils'
import Row from '../Row'
import styles from './Tags.module.scss'

export type Props<T extends string> = {
  tags: T[]
  selected?: T
  onSelect?: (tag: T) => void
}

const Tags = <T extends string>({ tags, onSelect, selected }: Props<T>) => {
  return (
    <Row className={styles.container}>
      {tags.map(tag => (
        <span
          key={tag}
          className={classes(
            selected === tag ? styles.selectedTag : styles.tag,
            onSelect ? styles.selectable : undefined,
          )}
          onClick={() => onSelect?.(tag)}>
          {tag}
        </span>
      ))}
    </Row>
  )
}
export default Tags
