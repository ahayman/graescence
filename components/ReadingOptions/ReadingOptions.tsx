import { useContext, useEffect, useRef, MouseEvent } from 'react'
import { OptionsContext } from '../../providers/Options/Provider'
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

type Position = {
  top: number
  right: number
}

const ReadingOptions = () => {
  const {
    state: {
      readingOptions: { showOptions, textAlign, font },
    },
    actions: {
      adjustReadingOption,
      setShowReadingOptions,
      toggleShowReadingOptions,
      setReadingTextAlign,
      selectReadingFont,
    },
  } = useContext(OptionsContext)
  const iconPos = useRef<Position>({ top: 0, right: 0 }).current

  const updateIconPos = () => {
    const pos = document.getElementById('readingIcon')?.getBoundingClientRect()
    console.log('readingPosition: ', pos)
    if (pos) {
      iconPos.top = pos.bottom + 5
      iconPos.right = window.innerWidth - pos.right
    }
  }
  useEffect(updateIconPos)

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
      </div>
    </Column>
  )
}
export default ReadingOptions
