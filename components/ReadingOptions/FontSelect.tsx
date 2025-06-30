import { Font, FontDefinitions, Fonts } from '../../lib/globals'
import { classes, groupArray } from '../../lib/utils'
import Column from '../Column'
import Row from '../Row'
import styles from './ReadingOptions.module.scss'
import utilStyles from '../../styles/utils.module.scss'

type Props = {
  selected: Font
  onSelect: (font: Font) => void
}

const FontGroups = groupArray(
  3,
  Fonts.map(f => f),
)

const FontSelect = ({ selected, onSelect }: Props) => (
  <Column horizontal="center">
    {FontGroups.map((fonts, idx) => (
      <Row horizontal="space-between" key={`FontGroup.${idx}`} className={styles.fontSelectContainer}>
        {fonts.map(font => {
          const def = FontDefinitions[font]
          return (
            <Column
              style={{ flex: 1 }}
              horizontal="center"
              onClick={() => onSelect(font)}
              className={classes(font === selected ? styles.fontSelect : styles.fontUnselect, utilStyles.buttonHover)}
              key={def.name}>
              <span className={styles.fontSelectAa} style={{ fontFamily: def.name }}>
                Aa
              </span>
              <span className={styles.fontSelectTitle}>{def.title}</span>
            </Column>
          )
        })}
      </Row>
    ))}
  </Column>
)
export default FontSelect
