import { Adjustment, ReadingOption } from '../../providers/Options/Types'
import styles from './ReadingOptions.module.css'
import Row from '../Row'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'

const OptionText: { [key in ReadingOption]: string } = {
  fontSize: 'Text Size',
  paragraphIndent: 'Indent',
  paragraphSpacing: 'Spacing',
  lineSpacing: 'Line Spacing',
  letterSpacing: 'Letter Spacing',
  wordSpacing: 'Word Spacing',
}

type Props = {
  option: ReadingOption
  onAdjust: (option: ReadingOption, adjust: Adjustment) => void
}
const ReadingAdjustment = ({ onAdjust, option }: Props) => (
  <Row horizontal="space-between" vertical="center" className={styles.row}>
    <button className={styles.button} onClick={() => onAdjust(option, 'decrease')}>
      <FontAwesomeIcon icon={faMinus} className={styles.icon} />
    </button>
    <span className={styles.optionText}>{OptionText[option]}</span>
    <button className={styles.button} onClick={() => onAdjust(option, 'increase')}>
      <FontAwesomeIcon icon={faPlus} className={styles.icon} />
    </button>
  </Row>
)
export default ReadingAdjustment
