'use client'
import { FunctionComponent, PropsWithChildren, useContext, useEffect, useState } from 'react'
import s from './MainLayout.module.scss'
import Content from '../Content/Content'
import Nav from '../Nav/nav'
import { DisplayContext } from '../../providers/Display/Provider'
import { classes } from '../../lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronUp } from '@fortawesome/free-solid-svg-icons'

type Props = PropsWithChildren

export const MainLayout: FunctionComponent<Props> = ({ children }) => {
  const {
    state: { fullScreen },
    actions: { toggleFullScreen },
  } = useContext(DisplayContext)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => setLoaded(true), [])

  return (
    <div className={s.split}>
      {loaded && (
        <>
          <div className={classes(s.nav, fullScreen ? s.hide : undefined)}>
            <Nav />
            <FontAwesomeIcon
              className={classes(s.fullScreenIcon, fullScreen ? s.open : undefined)}
              icon={faChevronUp}
              onClick={toggleFullScreen}
            />
          </div>
          <div className={classes(fullScreen ? s.fullScreenContent : s.content)}>
            <Content>{children}</Content>
          </div>
        </>
      )}
    </div>
  )
}
