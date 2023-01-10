import { ReactNode } from 'react'

export type State = {
  optionsNode?: ReactNode
}

export type Actions = {
  setOptions: (node: ReactNode) => void
  clearOptions: () => void
}

export type Context = {
  state: State
  actions: Actions
}
