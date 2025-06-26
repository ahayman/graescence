import { getSortedContentData } from '../../api/contentData'
import HistoryList from './HistoryList'

export default async function PageData() {
  const data = (await getSortedContentData('History')).map(d => ({ ...d, html: undefined }))
  return <HistoryList historyData={data} />
}
