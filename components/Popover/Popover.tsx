import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from './Popover.module.scss'
import { ReactNode, useRef, useState, MouseEvent, CSSProperties, useId } from 'react'
import { classes } from '../../lib/utils'

export type Props = {
  icon: IconProp
  children: ReactNode
  style?: CSSProperties
  className?: string
}

type Position = {
  top: number
  right: number
}

const Popover = ({ icon, children, style, className }: Props) => {
  const iconPos = useRef<Position>({ top: 0, right: 0 }).current
  const [show, setShow] = useState(false)
  const iconId = useId()
  const contId = useId()

  const updateIconPos = () => {
    const pos = document.getElementById(iconId)?.getBoundingClientRect()
    if (pos) {
      iconPos.top = pos.bottom + 5
      iconPos.right = window.innerWidth - pos.right
    }
  }

  const toggle = (event: MouseEvent<HTMLDivElement>) => {
    const container = document.getElementById(contId)
    if (event.target === container) {
      updateIconPos()
      setShow(!show)
    }
  }

  return (
    <div style={style} className={className}>
      <div
        onClick={() => {
          updateIconPos()
          setShow(!show)
        }}>
        <FontAwesomeIcon id={iconId} icon={icon} className={styles.icon} />
      </div>
      <div
        id={contId}
        onClick={event => toggle(event)}
        className={classes(styles.popoverContainer, show ? styles.popoverShowing : styles.popoverHiding)}>
        <div style={{ marginTop: iconPos.top, marginRight: iconPos.right }} className={styles.popover}>
          {children}
        </div>
      </div>
    </div>
  )
}
export default Popover
