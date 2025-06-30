import { Adjustment, ReadingOption, ReadingOptions } from '../../providers/Options/Types'
import Row from '../Row'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faMinus } from '@fortawesome/free-solid-svg-icons'
import Column from '../Column'
import { classes } from '../../lib/utils'
import styles from './ReadingOptions.module.scss'
import utilStyles from '../../styles/utils.module.scss'

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
  <>
    <span className={styles.optionText}>{OptionText[option]}</span>
    <Column horizontal="center" className={styles.optionGroup}>
      <Row horizontal="space-between" vertical="center" className={styles.row}>
        <div className={classes(styles.button, utilStyles.buttonHover)} onClick={() => onAdjust(option, 'decrease')}>
          <FontAwesomeIcon icon={faMinus} className={styles.icon} />
        </div>
        <div className={styles.valueDisplay}>{`${value} ${uom}`}</div>
        <div className={classes(styles.button, utilStyles.buttonHover)} onClick={() => onAdjust(option, 'increase')}>
          <FontAwesomeIcon icon={faPlus} className={styles.icon} />
        </div>
      </Row>
    </Column>
  </>
)
export default ReadingAdjustment
