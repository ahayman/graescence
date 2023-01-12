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
  value: ReadingOptions
  onAdjust: (option: ReadingOption, adjust: Adjustment) => void
  onSet: (option: ReadingOption, value: number) => void
}
const ReadingAdjustment = ({ onAdjust, option, onSet, value }: Props) => (
  <Column horizontal="center" className={styles.optionGroup}>
    <span className={styles.optionText}>{OptionText[option]}</span>
    <Row horizontal="space-between" vertical="center" className={styles.row}>
      <div className={styles.button} onClick={() => onAdjust(option, 'decrease')}>
        <FontAwesomeIcon icon={faMinus} className={styles.icon} />
      </div>
      <input
        className={styles.slider}
        type="range"
        onChange={event => onSet(option, Number.parseFloat(event.target.value))}
        value={value[option]}
        min={ReadingParams[option].min}
        max={ReadingParams[option].max}
        step={ReadingParams[option].step}
      />
      <div className={styles.button} onClick={() => onAdjust(option, 'increase')}>
        <FontAwesomeIcon icon={faPlus} className={styles.icon} />
      </div>
    </Row>
  </Column>
)
export default ReadingAdjustment
