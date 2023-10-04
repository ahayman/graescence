import { getSortedContentData } from '../../api/contentData'
import Updates from './Updates'

export default async function PageData() {
  let updates = await getSortedContentData('updates')
  return <Updates updates={updates} />
}
