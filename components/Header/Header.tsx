import { classes } from '../../lib/utils'
import styles from '../../styles/utils.module.scss'

const styleFor = (type: HeaderType): string => {
  switch (type) {
    case 'Primary':
      return styles.primaryHeader
    case 'Secondary':
      return styles.secondaryHeader
    case 'Tertiary':
      return styles.tertiaryHeader
  }
}

export type HeaderType = 'Primary' | 'Secondary' | 'Tertiary'

export interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  type: HeaderType
  title?: string
  className?: string
  sticky?: boolean
}

const Header = ({ title, type, children, className, sticky }: Props) => (
  <div className={classes(className, styleFor(type), sticky ? styles.sticky : undefined)}>
    {title && <span>{title}</span>}
    {children}
  </div>
)
export default Header
