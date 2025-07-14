import { PatreonRedirectPage } from '../../../../components/Pages/Patreon/PatreonRedirectPage'
import { fetchAuthAndIdentity } from '../../../../providers/Patreon/Api'

type Params = {
  code?: string
  state?: string
}
type Props = {
  searchParams: Promise<Params>
  params: Promise<Params>
}

export default async function PatreonRedirectHandler(props: Props) {
  try {
    const p = await props.params
    const params = await props.searchParams
    const code = params['code']
    console.log(`Logging in using code: ${code}`)
    if (!code) throw new Error('Missing authorization code. Did you deny access?')
    const result = await fetchAuthAndIdentity(code)
    console.log({ result })
    return <PatreonRedirectPage {...result} />
  } catch (error) {
    console.log({ error })
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
