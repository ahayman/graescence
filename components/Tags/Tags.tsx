import { classes } from '../../lib/utils'
import Row from '../Row'
import styles from './Tags.module.scss'

export type Props<T extends string> = {
  tags: T[]
  selected?: T
  onSelect?: (tag: T) => void
  type?: 'primary' | 'secondary'
}

const Tags = <T extends string>({ tags, onSelect, selected, type }: Props<T>) => (
  <Row className={styles.container}>
    {tags.map(tag => (
      <span
        key={tag}
        className={classes(
          selected === tag ? styles.selectedTag : styles.tag,
          onSelect ? styles.selectable : undefined,
          type === 'secondary' ? styles.secondaryTag : undefined,
        )}
        onClick={() => onSelect?.(tag)}>
        {tag}
      </span>
    ))}
  </Row>
)
export default Tags
