'use client'
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
      <div className={styles.main}>
        <main>{load ? children : null}</main>
        <ContentBlock>
          <span style={{ color: 'transparent' }}>
            --------------------------------------------------------------------------------------------------------------------------------------------
          </span>
        </ContentBlock>
      </div>
    </div>
  )
}
export default Content
