'use client'
import Script from 'next/script'
import { ReactNode, useContext, useEffect, useState } from 'react'
import { DisplayContext } from '../../providers/Display/Provider'
import ContentBlock from '../ContentBlock/ContentBlock'
import Row from '../Row'
import styles from './Content.module.scss'

type Props = {
  children: ReactNode
}
const Content = ({ children }: Props) => {
  const [load, setLoad] = useState(false)

  //Note: Displaying after an initial render allows user variables to load before display.
  //This prevents text from displaying, then re-displaying with the loaded parameters.
  useEffect(() => setLoad(true), [])

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
      <Script id="commento-script" src="https://comments.aaronhayman.com/js/commento.js" strategy="afterInteractive" />
      <div className={styles.main}>
        <main>{load ? children : null}</main>
        <ContentBlock>
          <span style={{ color: 'transparent' }}>
            --------------------------------------------------------------------------------------------------------------------------------------------
          </span>
        </ContentBlock>
        <ContentBlock>
          <div id="commento"></div>
        </ContentBlock>
      </div>
    </div>
  )
}
export default Content
