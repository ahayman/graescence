import { format, parseISO } from 'date-fns'

export type Props = {
  dateString: string
}

const Date = ({ dateString }: Props) => {
  // De-localize the string so it's displayed as-is.
  const sanitizedDateString = dateString.endsWith('Z') ? dateString.slice(0, -1) : dateString
  return <time>{format(sanitizedDateString, 'LLLL d, yyyy')}</time>
}
export default Date
