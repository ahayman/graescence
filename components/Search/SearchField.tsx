import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { useState } from 'react'
import styles from './SearchField.module.scss'

export type Props = {
  text?: string
  onChange: (text: string) => void
}

const SearchField = ({ text, onChange }: Props) => {
  const [focused, setFocused] = useState(false)

  return (
    <div className={focused ? styles.focused : styles.unFocused}>
      {focused ? (
        <input
          className={styles.input}
          type="search"
          value={text}
          autoFocus={true}
          placeholder="Search"
          onChange={event => onChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      ) : (
        <FontAwesomeIcon className={styles.searchIcon} onClick={() => setFocused(true)} icon={faSearch} />
      )}
    </div>
  )
}
export default SearchField
