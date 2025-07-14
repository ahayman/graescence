import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { createURL } from '../components/Pages/History/utils/createURL'

type SetParam<Param extends string> = (param: Param, value?: string | Partial<{ [key in Param]: string }>) => void
type Params<Param extends string> = { [key in Param]: string | undefined }

export const useQueryParams = <T extends string>(): [Params<T>, SetParam<T>] => {
  const router = useRouter()
  const searchParams = useSearchParams() ?? undefined
  const path = usePathname() ?? ''

  const setParam: SetParam<T> = useCallback(
    (param, value) => {
      const newParams = new URLSearchParams(searchParams)
      if (typeof value === 'object')
        Object.entries(value).forEach(([k, v]) =>
          typeof v === 'string' && v ? newParams.set(k, v) : newParams.delete(k),
        )
      else if (value) newParams.set(param, value)
      else newParams.delete(param)
      router.replace(createURL(path, newParams).toString())
    },
    [searchParams, router, path],
  )

  const params = Object.fromEntries(searchParams?.entries() ?? []) as Params<T>

  return [params, setParam]
}
