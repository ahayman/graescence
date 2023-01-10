import { TextAlign } from '../../providers/Options/Types'
import styles from './ReadingOptions.module.css'
import Row from '../Row'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAlignCenter, faAlignJustify, faAlignLeft, faAlignRight } from '@fortawesome/free-solid-svg-icons'
import { classes } from '../../lib/utils'

type Props = {
  align: TextAlign
  onSelect: (align: TextAlign) => void
}

const TextAlignSelect = ({ align, onSelect }: Props) => (
  <Row horizontal="center" vertical="center" className={styles.alignContainer}>
    <button
      className={classes(styles.buttonLeft, align === 'left' ? styles.buttonSelect : styles.buttonUnSelect)}
      onClick={() => onSelect('left')}>
      <FontAwesomeIcon icon={faAlignLeft} className={styles.icon} />
    </button>
    <button
      className={classes(styles.buttonMiddle, align === 'center' ? styles.buttonSelect : styles.buttonUnSelect)}
      onClick={() => onSelect('center')}>
      <FontAwesomeIcon icon={faAlignCenter} className={styles.icon} />
    </button>
    <button
      className={classes(styles.buttonMiddle, align === 'justify' ? styles.buttonSelect : styles.buttonUnSelect)}
      onClick={() => onSelect('justify')}>
      <FontAwesomeIcon icon={faAlignJustify} className={styles.icon} />
    </button>
    <button
      className={classes(styles.buttonRight, align === 'right' ? styles.buttonSelect : styles.buttonUnSelect)}
      onClick={() => onSelect('right')}>
      <FontAwesomeIcon icon={faAlignRight} className={styles.icon} />
    </button>
  </Row>
)
export default TextAlignSelect
