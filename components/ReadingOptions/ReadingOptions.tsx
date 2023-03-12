import { useContext, useEffect, useRef, MouseEvent } from 'react'
import { OptionsContext } from '../../providers/Options/Provider'
import styles from './ReadingOptions.module.scss'
import Column from '../Column'
import Row from '../Row'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGlasses, faRefresh } from '@fortawesome/free-solid-svg-icons'
import { classes } from '../../lib/utils'
import TextAlignSelect from './TextAlignSelect'
import ReadingAdjustment from './ReadingAdjustment'
import FontSelect from './FontSelect'
import Popover from '../Popover/Popover'

const ReadingOptions = () => {
  const {
    state: { readingOptions },
    actions: {
      adjustReadingOption,
      setReadingOption,
      setShowReadingOptions,
      setReadingTextAlign,
      selectReadingFont,
      resetReadingOptions,
    },
  } = useContext(OptionsContext)
  const { textAlign, font } = readingOptions

  useEffect(() => {
    return () => {
      setShowReadingOptions(false)
    }
  }, [setShowReadingOptions])

  return (
    <Popover icon={faGlasses} name="ReadingOptions">
      <div className={styles.optionHeader}>Text</div>
      <FontSelect selected={font} onSelect={selectReadingFont} />
      <ReadingAdjustment
        value={readingOptions}
        option="fontSize"
        onAdjust={adjustReadingOption}
        onSet={setReadingOption}
      />
      <ReadingAdjustment
        value={readingOptions}
        option="wordSpacing"
        onAdjust={adjustReadingOption}
        onSet={setReadingOption}
      />
      <ReadingAdjustment
        value={readingOptions}
        option="letterSpacing"
        onAdjust={adjustReadingOption}
        onSet={setReadingOption}
      />
      <ReadingAdjustment
        value={readingOptions}
        option="lineSpacing"
        onAdjust={adjustReadingOption}
        onSet={setReadingOption}
      />
      <div style={{ marginTop: 5 }} className={styles.optionHeader}>
        Paragraph
      </div>
      <TextAlignSelect align={textAlign} onSelect={setReadingTextAlign} />
      <ReadingAdjustment
        value={readingOptions}
        option="paragraphIndent"
        onAdjust={adjustReadingOption}
        onSet={setReadingOption}
      />
      <ReadingAdjustment
        value={readingOptions}
        option="paragraphSpacing"
        onAdjust={adjustReadingOption}
        onSet={setReadingOption}
      />
      <ReadingAdjustment
        value={readingOptions}
        option="readingWidth"
        onAdjust={adjustReadingOption}
        onSet={setReadingOption}
      />
      <Row horizontal="center">
        <div className={styles.reset} onClick={resetReadingOptions}>
          <FontAwesomeIcon icon={faRefresh} className={styles.icon} />
        </div>
      </Row>
    </Popover>
  )
}
export default ReadingOptions
