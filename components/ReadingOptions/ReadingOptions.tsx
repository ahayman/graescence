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

type Position = {
  top: number
  right: number
}

const ReadingOptions = () => {
  const {
    state: { readingOptions },
    actions: {
      adjustReadingOption,
      setReadingOption,
      setShowReadingOptions,
      toggleShowReadingOptions,
      setReadingTextAlign,
      selectReadingFont,
      resetReadingOptions,
    },
  } = useContext(OptionsContext)
  const iconPos = useRef<Position>({ top: 0, right: 0 }).current
  const { showOptions, textAlign, font } = readingOptions

  const updateIconPos = () => {
    const pos = document.getElementById('readingIcon')?.getBoundingClientRect()
    if (pos) {
      iconPos.top = pos.bottom + 5
      iconPos.right = window.innerWidth - pos.right
    }
  }

  useEffect(() => {
    return () => {
      setShowReadingOptions(false)
    }
  }, [setShowReadingOptions])

  const toggle = (event: MouseEvent<HTMLDivElement>) => {
    const container = document.getElementById('readingOptionsContainer')
    if (event.target === container) {
      updateIconPos()
      toggleShowReadingOptions()
    }
  }

  return (
    <Column className={styles.container}>
      <Row horizontal="end">
        <div
          className={styles.iconContainer}
          onClick={() => {
            updateIconPos()
            toggleShowReadingOptions()
          }}>
          <FontAwesomeIcon id="readingIcon" icon={faGlasses} className={styles.icon} />
        </div>
      </Row>
      <div
        id="readingOptionsContainer"
        onClick={event => toggle(event)}
        className={classes(styles.menuContainer, showOptions ? styles.menuShowing : styles.menuHiding)}>
        <div style={{ marginTop: iconPos.top, marginRight: iconPos.right }} className={styles.menu}>
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
        </div>
      </div>
    </Column>
  )
}
export default ReadingOptions
