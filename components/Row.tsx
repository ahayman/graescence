import React, { CSSProperties, ReactNode } from 'react'
export type Alignment = 'center' | 'start' | 'end' | 'space-between' | 'space-around'

interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  style?: CSSProperties
  children?: ReactNode
  horizontal?: Alignment
  vertical?: Alignment
  scrollable?: boolean
  gap?: number
}

const getAlignment = (direction: 'alignItems' | 'justifyContent', alignment?: Alignment) => {
  if (!alignment) {
    return {}
  }
  let flexAlign = ''
  switch (alignment) {
    case 'center':
      flexAlign = 'center'
      break
    case 'start':
      flexAlign = 'flex-start'
      break
    case 'end':
      flexAlign = 'flex-end'
      break
    case 'space-between':
      flexAlign = 'space-between'
      break
    case 'space-around':
      flexAlign = 'space-around'
      break
  }
  return { [direction]: flexAlign }
}

const Row = ({ scrollable, horizontal, vertical, children, gap, ...props }: Props) => (
  <div
    {...props}
    style={{
      display: 'flex',
      flexDirection: 'row',
      ...getAlignment('justifyContent', horizontal),
      ...getAlignment('alignItems', vertical),
      ...(props.style || {}),
      ...(scrollable ? { overflow: 'scroll' } : {}),
      ...(gap !== undefined ? { gap } : {}),
    }}>
    {children}
  </div>
)
export default Row
