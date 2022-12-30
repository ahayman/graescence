import { createContext, ReactNode } from 'react'
import { State } from './Types'

const InitialState: State = {
  posts: [],
  chapters: [],
}

export const ContentContext = createContext<State>(InitialState)

export type Props = {
  children: ReactNode
  value: State
}

const ContentProvider = ({ children, value }: Props) => (
  <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
)
export default ContentProvider
