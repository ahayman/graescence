import { FunctionComponent } from 'react'
import Row from '../../Row'
import Column from '../../Column'
import { classes } from '../../../lib/utils'
import utilStyles from '../../../styles/utils.module.scss'
import styles from './PageLayout.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookOpen, faScroll } from '@fortawesome/free-solid-svg-icons'

export type PageLayout = 'paged' | 'verticalScroll'
type Props = {
  selected: PageLayout
  onSelect: (layout: PageLayout) => void
}

export const PageLayoutSelect: FunctionComponent<Props> = ({ selected, onSelect }) => (
  <Row vertical="center" horizontal="center">
    <Column
      vertical="center"
      horizontal="center"
      className={classes(
        utilStyles.leftRounded,
        utilStyles.buttonHover,
        selected === 'paged' ? styles.buttonSelect : styles.button,
      )}
      onClick={() => onSelect('paged')}>
      <FontAwesomeIcon icon={faBookOpen} />
    </Column>
    <Column
      vertical="center"
      horizontal="center"
      className={classes(
        utilStyles.rightRounded,
        utilStyles.buttonHover,
        utilStyles.buttonHover,
        selected === 'verticalScroll' ? styles.buttonSelect : styles.button,
      )}
      onClick={() => onSelect('verticalScroll')}>
      <FontAwesomeIcon icon={faScroll} />
    </Column>
  </Row>
)
