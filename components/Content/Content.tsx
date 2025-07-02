'use client'
import Script from 'next/script'
import { ReactNode, useContext, useId, MouseEvent, useEffect } from 'react'
import { DisplayContext } from '../../providers/Display/Provider'
import { classes } from '../../lib/utils'
import styles from './Content.module.scss'
import popoverStyles from '../Popover/Popover.module.scss'
import { usePathname } from 'next/navigation'

type Props = {
  children: ReactNode
}

const Content = ({ children }: Props) => {
  const {
    state: { popover },
    actions: { closePopover },
  } = useContext(DisplayContext)
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
      <Script id="fathom-analytics" strategy="afterInteractive">
        {`
          (function(f, a, t, h, o, m){
            a[h]=a[h]||function(){
              (a[h].q=a[h].q||[]).push(arguments)
            };
            o=f.createElement('script'),
            m=f.getElementsByTagName('script')[0];
            o.async=1; o.src=t; o.id='fathom-script';
            m.parentNode.insertBefore(o,m)
          })(document, window, '//fathom.aaronhayman.com/tracker.js', 'fathom');
          fathom('set', 'siteId', 'IRIBQ');
          fathom('trackPageview');
          `}
      </Script>
      {/* <Script id="commento-script" src="https://comments.aaronhayman.com/js/commento.js" strategy="afterInteractive" /> */}
      <div id="main-content-container" className={styles.main}>
        {children}
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
