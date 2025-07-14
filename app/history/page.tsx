import HistoryList from '../../components/Pages/History/HistoryList'
import { getSortedContentData } from '../../staticGenerator/contentData'

export default async function PageData() {
  const data = (await getSortedContentData('History')).map(d => ({ ...d, html: undefined }))
  return <HistoryList historyData={data} />
}
