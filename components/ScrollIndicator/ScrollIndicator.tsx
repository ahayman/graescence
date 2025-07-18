import {
  CSSProperties,
  FunctionComponent,
  MouseEventHandler,
  TouchEventHandler,
  useEffect,
  useRef,
  useState,
} from 'react'
import styles from './ScrollIndicator.module.scss'
import { classes } from '../../lib/utils'
import Row from '../Row'
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type Props = {
  pageCount: number
  progress: number
  onClick?: (page: number) => void
  className?: string
  sizeFactor?: number
}

type GhostIndexes = [number | null, number | null]

const calculateScale = (page: number, count: number, progress: number): number => {
  if (count < 1) return 0
  const pageDist = 1 / (count - 1)
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
  const [ghosts, setGhosts] = useState<GhostIndexes>([null, null])
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

  const updateGhostsWith = (idx: number) => {
    if (idx === currentIndex) return
    if (ghosts[0] === null && ghosts[1] === null) {
      setGhosts([currentIndex, null])
    } else if (ghosts[0] === idx) {
      if (ghosts[1] !== null) {
        setGhosts([ghosts[1], currentIndex])
      } else {
        setGhosts([currentIndex, null])
      }
    } else {
      setGhosts([ghosts[0], currentIndex])
    }
  }

  const calculateHover = (idx: number) => {
    const container = containerRef.current
    const ghost = ghosts[0] === idx ? 'primary' : ghosts[1] === idx ? 'secondary' : undefined
    if (!container) return null

    const width = container.getBoundingClientRect().width
    const increments = width / (pageCount - 1)
    const left = idx * increments - 3
    const lastIndex = idx === pageCount - 1
    const visible = hoverState[idx] || ghost !== undefined || lastIndex

    const onSelect = () => {
      if (ghost) updateGhostsWith(idx)
      onClick?.(idx)
    }
    return (
      <HoverIndicator
        key={`hover-indicator-${idx}`}
        style={{ top: 3, left }}
        page={idx + 1}
        visible={visible}
        onSelect={onSelect}
        ghost={ghost}
        lastIndicator={lastIndex}
      />
    )
  }

  const handleUp: MouseEventHandler<HTMLDivElement> = event => {
    const container = event.currentTarget
    const rect = container.getBoundingClientRect()
    const width = rect.width
    const increments = width / pageCount
    const clientX = event.clientX - rect.left
    const idx = Math.floor(clientX / increments)
    updateGhostsWith(idx)
    setHoverState(s => s.map(() => false))
    onClick?.(idx)
  }

  const incrementIndex = () => {
    if (currentIndex >= pageCount) return
    onClick?.(currentIndex + 1)
  }

  const decrementIndex = () => {
    if (currentIndex <= 0) return
    onClick?.(currentIndex - 1)
  }

  const handleHover: MouseEventHandler<HTMLDivElement> = event => {
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

  const handleTouchUp: TouchEventHandler<HTMLDivElement> = event => {
    const container = event.currentTarget
    const rect = container.getBoundingClientRect()
    const width = rect.width
    const clientX = event.touches[0].clientX - rect.left
    const increments = width / pageCount
    const idx = Math.max(0, Math.min(Math.floor(clientX / increments), pageCount - 1))
    updateGhostsWith(idx)
    setHoverState(s => s.map(() => false))
    onClick?.(idx)
  }

  const handleMoveOut = () => {
    setHoverState(s => s.map(() => false))
  }

  const pageIndexes = [...Array(pageCount).keys()]

  return (
    <Row className={classes(styles.container, className)}>
      <FontAwesomeIcon className={styles.chevron} icon={faChevronLeft} onClick={decrementIndex} />
      <div
        ref={containerRef}
        onMouseLeave={handleMoveOut}
        onMouseUp={handleUp}
        onMouseMoveCapture={handleHover}
        onTouchEnd={handleTouchUp}
        className={classes(styles.scrollContainer)}>
        <div className={styles.scrollLine} />
        {pageIndexes.map(calculateHover)}
        {pageIndexes.map(calculateIndicator)}
      </div>
      <FontAwesomeIcon className={styles.chevron} icon={faChevronRight} onClick={incrementIndex} />
    </Row>
  )
}

type HoverIndicatorProps = {
  page: number
  visible: boolean
  onSelect: () => void
  ghost?: 'primary' | 'secondary'
  style?: CSSProperties
  lastIndicator?: boolean // Last indicator is always clickable
}
const HoverIndicator: FunctionComponent<HoverIndicatorProps> = ({
  page,
  visible,
  ghost,
  style,
  onSelect,
  lastIndicator,
}) => {
  const [added, setAdded] = useState(false)

  useEffect(() => setAdded(true), [])

  const animationStyle = visible && added ? styles.hoverAnimateIn : undefined
  const ghostStyle =
    ghost === 'primary' ? styles.ghostIndicator : ghost === 'secondary' ? styles.secondaryGhostIndicator : undefined
  const lastStyle = lastIndicator ? styles.lastIndicator : undefined

  return (
    <div
      onClick={onSelect}
      key={`page-hover-${page}`}
      style={style}
      className={classes(styles.hoverIndicator, animationStyle, ghostStyle, lastStyle)}>
      <div className={styles.hoverText}>{page}</div>
    </div>
  )
}
