import { Adjustment, ReadingOption, ReadingOptions } from '../../providers/Options/Types'
import styles from './ReadingOptions.module.scss'
import Row from '../Row'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import Column from '../Column'
import { ReadingParams } from '../../providers/Options/Reducer'

const OptionText: { [key in ReadingOption]: string } = {
  fontSize: 'Text Size',
  paragraphIndent: 'Indent',
  paragraphSpacing: 'Spacing',
  lineSpacing: 'Line Spacing',
  letterSpacing: 'Letter Spacing',
  wordSpacing: 'Word Spacing',
  readingWidth: 'Max Width',
}

type Props = {
  option: ReadingOption
  value: number
  uom: string
  onAdjust: (option: ReadingOption, adjust: Adjustment) => void
}
const ReadingAdjustment = ({ onAdjust, option, value, uom }: Props) => (
  <Column horizontal="center" className={styles.optionGroup}>
    <span className={styles.optionText}>{OptionText[option]}</span>
    <Row horizontal="space-between" vertical="center" className={styles.row}>
      <div className={styles.button} onClick={() => onAdjust(option, 'decrease')}>
        <FontAwesomeIcon icon={faMinus} className={styles.icon} />
      </div>
      <div className={styles.valueDisplay}>{`${value} ${uom}`}</div>
      <div className={styles.button} onClick={() => onAdjust(option, 'increase')}>
        <FontAwesomeIcon icon={faPlus} className={styles.icon} />
      </div>
    </Row>
  </Column>
)
export default ReadingAdjustment
