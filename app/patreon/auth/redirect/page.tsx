import { fetchAuthAndIdentity } from '../../../../providers/Patreon/Api'
import { PatreonRedirectPage } from './PatreonRedirectPage'

type Params = {
  code?: string
  state?: string
}
type Props = {
  searchParams: Promise<Params>
}

export default async function PatreonRedirectHandler({ searchParams }: Props) {
  try {
    const code = (await searchParams).code
    if (!code) throw new Error('Missing authorization code. Did you deny access?')
    const result = await fetchAuthAndIdentity(code)
    return <PatreonRedirectPage {...result} />
  } catch (error) {
    return (
      <div>
        {JSON.stringify(error, null, 4)
          .split('\n')
          .map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
      </div>
    )
  }
}

export const dynamic = 'force-dynamic'
