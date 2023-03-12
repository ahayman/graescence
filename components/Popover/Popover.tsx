import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './Popover.module.scss'
import { ReactNode, CSSProperties, useId, useContext } from 'react'
import { DisplayContext } from '../../providers/Display/Provider'

export type Props = {
  name: string
  icon: IconProp
  children: ReactNode
  style?: CSSProperties
  className?: string
}

const Popover = ({ name, icon, children, style, className }: Props) => {
  const {
    state: { popover },
    actions: { openPopover, closePopover },
  } = useContext(DisplayContext)
  const iconId = useId()

  const iconPos = () => {
    const pos = document.getElementById(iconId)?.getBoundingClientRect()
    if (pos) {
      return { top: pos.bottom + 5, right: window.innerWidth - pos.right }
    }
    return { top: 0, right: window.innerWidth }
  }

  return (
    <div style={style} className={className}>
      <div
        onClick={() => {
          if (popover === undefined) {
            const pos = iconPos()
            openPopover({ content: children, ...pos, name })
          } else {
            closePopover()
          }
        }}>
        <FontAwesomeIcon id={iconId} icon={icon} className={styles.icon} />
      </div>
    </div>
  )
}
export default Popover
