import { classes } from '../../lib/utils'
import styles from '../../styles/utils.module.scss'

const styleFor = (type: HeaderType): string => {
  switch (type) {
    case 'Primary':
      return styles.primaryHeader
    case 'Secondary':
      return styles.secondaryHeader
  }
}

export type HeaderType = 'Primary' | 'Secondary'

export interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  type: HeaderType
  title?: string
  className?: string
}

const Header = ({ title, type, children, className }: Props) => (
  <div className={classes(className, styleFor(type))}>
    {title && <span>{title}</span>}
    {children}
  </div>
)
export default Header
