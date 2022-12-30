import { Font } from '../../lib/globals'

export type ReadingOptions = {
  font: Font
  showOptions: boolean
  fontSize: number
  paragraphIndent: number
  paragraphSpacing: number
  lineSpacing: number
  letterSpacing: number
  wordSpacing: number
  textAlign: TextAlign
}

export type State = {
  readingOptions: ReadingOptions
}

export type TextAlign = 'left' | 'right' | 'justify' | 'center'

export type ReadingOption =
  | 'fontSize'
  | 'paragraphIndent'
  | 'paragraphSpacing'
  | 'lineSpacing'
  | 'letterSpacing'
  | 'wordSpacing'

export type Adjustment = 'increase' | 'decrease'

export type Actions = {
  adjustReadingOption: (option: ReadingOption, adjust: Adjustment) => void
  setReadingOption: (option: ReadingOption, value: number) => void
  toggleShowReadingOptions: () => void
  setReadingTextAlign: (textAlign: TextAlign) => void
  resetReadingOptions: () => void
  selectReadingFont: (font: Font) => void
}

export type Context = {
  state: State
  actions: Actions
}
