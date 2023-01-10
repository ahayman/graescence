import React, { ReactNode } from 'react'
import { classes } from '../../lib/utils'
import styles from './ContentBlock.module.scss'

export interface Props extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: ReactNode
  className?: string
}

const ContentBlock = ({ children, className, ...props }: Props) => (
  <div {...props} className={classes(className, styles.container)}>
    {children}
  </div>
)

export default ContentBlock
