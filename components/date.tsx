import { format, parseISO } from 'date-fns'

export type Props = {
  dateString: string
}

const Date = ({ dateString }: Props) => (
  <time dateTime={dateString}>{format(parseISO(dateString), 'LLLL d, yyyy')}</time>
)
export default Date
