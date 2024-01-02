import { ReactNode, CSSProperties, useId, useContext, useEffect, useCallback } from 'react'
import { DisplayContext } from '../../providers/Display/Provider'

export type Props = {
  name: string
  children: ReactNode
}

const CenterPopover = ({ name, children }: Props) => {
  const {
    state: { popover },
    actions: { openPopover, closePopover },
  } = useContext(DisplayContext)

  const pos = useCallback(() => {
    const pos = document.getElementById('main-content')?.getBoundingClientRect()
    if (pos) {
      return { top: pos.top + 5, right: window.innerWidth - (pos.right + pos.width) }
    }
    return { top: 0, right: window.innerWidth }
  }, [])

  useEffect(() => {
    openPopover({ content: children, ...pos(), name })
    return () => {
      closePopover()
    }
  }, [children, pos, openPopover, name, closePopover])

  return <div />
}
export default CenterPopover
