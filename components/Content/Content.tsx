'use client'
import Script from 'next/script'
import { ReactNode, useContext, useId, MouseEvent, useEffect } from 'react'
import { DisplayContext } from '../../providers/Display/Provider'
import { classes } from '../../lib/utils'
import styles from './Content.module.scss'
import popoverStyles from '../Popover/Popover.module.scss'
import { usePathname } from 'next/navigation'
import { PatreonContext } from '../../providers/Patreon/Provider'

type Props = {
  children: ReactNode
}

const Content = ({ children }: Props) => {
  const {
    state: { popover },
    actions: { closePopover },
  } = useContext(DisplayContext)
  const { logs } = useContext(PatreonContext)
  const contId = useId()
  const path = usePathname()

  const toggle = (event: MouseEvent<HTMLDivElement>) => {
    const container = document.getElementById(contId)
    if (event.target === container) {
      closePopover()
    }
  }

  useEffect(() => closePopover(), [closePopover, path])

  return (
    <div className={styles.mainContainer}>
      <div id="main-content-container" className={styles.main}>
        {children}
        <div
          style={{
            position: 'absolute',
            bottom: 20,
            left: 0,
            height: 100,
            overflow: 'scroll',
            zIndex: 100000,
            backgroundColor: 'darkgoldenrod',
          }}>
          {logs.map((l, i) => (
            <p key={`log-${i}`}>{l}</p>
          ))}
        </div>
      </div>
      <div
        id={contId}
        onClick={event => toggle(event)}
        className={classes(
          popoverStyles.popoverContainer,
          popover !== undefined ? popoverStyles.popoverShowing : popoverStyles.popoverHiding,
        )}>
        <div style={{ marginTop: popover?.top, marginRight: popover?.right }} className={popoverStyles.popover}>
          {popover?.content}
        </div>
      </div>
    </div>
  )
}
export default Content
