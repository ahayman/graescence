import { useContext, useEffect } from 'react'
import { OptionsContext } from '../../providers/Options/Provider'
import styles from './ReadingOptions.module.scss'
import Row from '../Row'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRefresh } from '@fortawesome/free-solid-svg-icons'
import TextAlignSelect from './TextAlignSelect'
import ReadingAdjustment from './ReadingAdjustment'
import FontSelect from './FontSelect'
import Column from '../Column'
import { PageLayoutSelect } from './components/PageLayout'
import utilStyles from '../../styles/utils.module.scss'
import { classes } from '../../lib/utils'

const ReadingOptions = () => {
  const {
    state: { readingOptions },
    actions: {
      adjustReadingOption,
      setShowReadingOptions,
      setReadingTextAlign,
      selectReadingFont,
      resetReadingOptions,
      setPageLayout,
    },
  } = useContext(OptionsContext)
  const { textAlign, font, fontSize, paragraphIndent, paragraphSpacing, readingWidth } = readingOptions

  useEffect(() => {
    return () => {
      setShowReadingOptions(false)
    }
  }, [setShowReadingOptions])

  return (
    <Column>
      <div className={styles.optionHeader}>Page Layout</div>
      <PageLayoutSelect selected={readingOptions.pageLayout} onSelect={setPageLayout} />
      <div className={styles.optionHeader}>Text</div>
      <FontSelect selected={font} onSelect={selectReadingFont} />
      <ReadingAdjustment value={Math.round(fontSize * 100)} uom="%" option="fontSize" onAdjust={adjustReadingOption} />
      <div style={{ marginTop: 5 }} className={styles.optionHeader}>
        Paragraph
      </div>
      <TextAlignSelect align={textAlign} onSelect={setReadingTextAlign} />
      <ReadingAdjustment
        value={paragraphIndent * 2}
        uom="chars"
        option="paragraphIndent"
        onAdjust={adjustReadingOption}
      />
      <ReadingAdjustment
        value={Math.round(paragraphSpacing * 100)}
        uom="% line height"
        option="paragraphSpacing"
        onAdjust={adjustReadingOption}
      />
      <ReadingAdjustment value={readingWidth} uom="pts" option="readingWidth" onAdjust={adjustReadingOption} />
      <Row horizontal="center" style={{ paddingTop: 5, paddingBottom: 5 }}>
        <div className={classes(styles.reset, utilStyles.buttonHover)} onClick={resetReadingOptions}>
          <FontAwesomeIcon icon={faRefresh} className={classes(styles.icon)} />
        </div>
      </Row>
    </Column>
  )
}
export default ReadingOptions
