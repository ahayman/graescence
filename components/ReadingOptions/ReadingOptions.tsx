import { useContext } from 'react'
import { OptionsContext } from '../../contexts/Options/Provider'
import styles from './ReadingOptions.module.css'
import utilStyles from '../../styles/utils.module.scss'
import Column from '../Column'
import Row from '../Row'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlasses } from '@fortawesome/free-solid-svg-icons'
import { classes } from '../../lib/utils'
import TextAlignSelect from './TextAlignSelect'
import ReadingAdjustment from './ReadingAdjustment'
import FontSelect from './FontSelect'

const ReadingOptions = () => {
  const {
    state: {
      readingOptions: { showOptions, textAlign, font },
    },
    actions: { adjustReadingOption, toggleShowReadingOptions, setReadingTextAlign, selectReadingFont },
  } = useContext(OptionsContext)

  return (
    <Column className={styles.container}>
      <Row horizontal="end">
        <div className={styles.iconContainer} onClick={toggleShowReadingOptions}>
          <FontAwesomeIcon icon={faGlasses} className={styles.icon} />
        </div>
      </Row>
      <div
        className={showOptions ? styles.optionsShowing : styles.optionsHiding}
        style={{
          opacity: showOptions ? 1 : 0,
          maxHeight: showOptions ? 1000 : 0,
          maxWidth: showOptions ? 1000 : 0,
        }}>
        <h1 className={styles.optionText}>Text</h1>
        <hr className={classes(utilStyles.lightHR)} />
        <FontSelect selected={font} onSelect={selectReadingFont} />
        <ReadingAdjustment option="fontSize" onAdjust={adjustReadingOption} />
        <ReadingAdjustment option="wordSpacing" onAdjust={adjustReadingOption} />
        <ReadingAdjustment option="letterSpacing" onAdjust={adjustReadingOption} />
        <ReadingAdjustment option="lineSpacing" onAdjust={adjustReadingOption} />
        <br />
        <h1 className={styles.optionText}>Paragraph</h1>
        <hr className={classes(utilStyles.lightHR)} />
        <TextAlignSelect align={textAlign} onSelect={setReadingTextAlign} />
        <ReadingAdjustment option="paragraphIndent" onAdjust={adjustReadingOption} />
        <ReadingAdjustment option="paragraphSpacing" onAdjust={adjustReadingOption} />
      </div>
    </Column>
  )
}
export default ReadingOptions
