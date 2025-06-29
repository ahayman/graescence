import { CSSProperties, FunctionComponent, MouseEventHandler, useEffect, useRef, useState } from 'react'
import styles from './ScrollIndicator.module.scss'
import { classes } from '../../lib/utils'
import Row from '../Row'
import { faArrowLeft, faArrowRight, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type Props = {
  pageCount: number
  progress: number
  onClick?: (page: number) => void
  className?: string
  sizeFactor?: number
}

const calculateScale = (page: number, count: number, progress: number): number => {
  if (count < 1) return 0
  const pageDist = 1 / count
  const distFromProgress = Math.abs(page * pageDist - progress)
  if (distFromProgress >= pageDist) return 0
  const pageProgress = (pageDist - distFromProgress) / pageDist
  return pageProgress
}

export const ScrollIndicator: FunctionComponent<Props> = ({
  pageCount,
  progress,
  onClick,
  className,
  sizeFactor = 2,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [hoverState, setHoverState] = useState<boolean[]>([])
  const currentIndex = Math.floor(pageCount * progress)

  const calculateIndicator = (idx: number) => {
    const scale = calculateScale(idx, pageCount, progress)
    const container = containerRef.current
    if (scale === 0 || !container) return null

    const width = container.getBoundingClientRect().width
    const increments = width / (pageCount - 1)
    const indicatorX = idx * increments

    return (
      <div
        key={`page-indicator-${idx}`}
        className={classes(styles.indicator)}
        style={{
          zIndex: scale,
          left: indicatorX - 3,
          top: 3,
          transform: `scale(${calculateScale(idx, pageCount, progress) * sizeFactor})`,
        }}>
        <div className={styles.selected} style={{ opacity: calculateScale(idx, pageCount, progress) }}>
          <div className={styles.selectedText}>{idx + 1}</div>
        </div>
      </div>
    )
  }

  const calculateHover = (idx: number) => {
    const visible = hoverState[idx]
    const container = containerRef.current
    if (!container) return null

    const width = container.getBoundingClientRect().width
    const increments = width / (pageCount - 1)
    const left = idx * increments - 3

    return <HoverIndicator style={{ top: 3, left, zIndex: 5 }} page={Number(idx) + 1} visible={visible} />
  }

  const handleUp: MouseEventHandler<HTMLDivElement> = event => {
    if (!onClick) return
    const container = event.currentTarget
    const rect = container.getBoundingClientRect()
    const width = rect.width
    const increments = width / pageCount
    const clientX = event.clientX - rect.left
    const idx = Math.floor(clientX / increments)
    console.log({ width, clientX, increments, idx })
    onClick(idx)
  }

  const incrementIndex = () => {
    if (currentIndex >= pageCount) return
    onClick?.(currentIndex + 1)
  }

  const decrementIndex = () => {
    if (currentIndex <= 0) return
    onClick?.(currentIndex - 1)
  }

  const handleDrag: MouseEventHandler<HTMLDivElement> = event => {
    if (event.buttons > 0) return
    const container = event.currentTarget
    const rect = container.getBoundingClientRect()
    const width = rect.width
    const clientX = event.clientX - rect.left
    const increments = width / pageCount
    const idx = Math.max(0, Math.floor(clientX / increments))
    const state = [...Array(pageCount).keys()].map(() => false)
    state[idx] = true
    setHoverState(state)
  }

  const handleMoveOut = () => {
    setHoverState(s => s.map(() => false))
  }

  return (
    <Row className={styles.container}>
      <FontAwesomeIcon className={styles.chevron} icon={faChevronLeft} onClick={decrementIndex} />
      <div
        onMouseLeave={handleMoveOut}
        onMouseUp={handleUp}
        onMouseMoveCapture={handleDrag}
        ref={containerRef}
        className={classes(styles.scrollContainer, className)}>
        <div className={styles.scrollLine} />
        {Object.keys(hoverState).map(idx => calculateHover(Number(idx)))}
        {[...Array(pageCount).keys()].map(idx => calculateIndicator(idx))}
      </div>
      <FontAwesomeIcon className={styles.chevron} icon={faChevronRight} onClick={incrementIndex} />
    </Row>
  )
}

type HoverIndicatorProps = {
  page: number
  visible: boolean
  style?: CSSProperties
}
const HoverIndicator: FunctionComponent<HoverIndicatorProps> = ({ page, visible, style }) => {
  const [added, setAdded] = useState(false)

  useEffect(() => setAdded(true), [])

  return (
    <div
      key={`page-hover-${page}`}
      style={style}
      className={classes(styles.hoverIndicator, visible && added ? styles.hoverAnimateIn : undefined)}>
      <div className={styles.hoverText}>{page}</div>
    </div>
  )
}
