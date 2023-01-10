import { createContext, ReactNode, useCallback, useState } from 'react'
import { Context, State } from './Types'

export type Props = {
  children: ReactNode
}

export const DisplayContext = createContext<Context>({} as any)

const DisplayProvider = ({ children }: Props) => {
  const [state, setState] = useState<State>({})

  const setOptions = useCallback((node: ReactNode) => {
    setState({ optionsNode: node })
  }, [])

  const clearOptions = useCallback(() => {
    setState({})
  }, [])

  return (
    <DisplayContext.Provider
      value={{
        state,
        actions: { setOptions, clearOptions },
      }}>
      {children}
    </DisplayContext.Provider>
  )
}
export default DisplayProvider
