import React, { useCallback, useEffect, useReducer } from 'react'
import { Font, FontDefinitions, Global, GlobalVariable, Storage, UITheme } from '../../lib/globals'
import Reducer from './Reducer'
import { Adjustment, Context, ReadingOption, State, TextAlign } from './Types'

const InitialState: State = {
  readingOptions: {
    font: 'Arial',
    showOptions: false,
    fontSize: 1,
    paragraphIndent: 1,
    paragraphSpacing: 1,
    lineSpacing: 1,
    letterSpacing: 1,
    wordSpacing: 1,
    textAlign: 'left',
  },
  uiTheme: 'dark',
}

export const OptionsContext = React.createContext<Context>({
  state: InitialState,
  actions: {} as any,
})

export type Props = {
  children: React.ReactNode
}

const getSetInitial = (name: GlobalVariable): string | undefined => {
  let value = Storage.get(name)
  if (!value) {
    value = Global.get(name)
    return value
  }
  Global.set(name, value)
  return value
}

const getSetInitialValue = (name: GlobalVariable, defaultValue: number = 1): number => {
  let value = Storage.getValue(name, defaultValue)
  if (value === undefined) {
    value = Global.getValue(name, defaultValue)
    return value
  }
  Global.setValue(name, value)
  return value
}

const Provider = ({ children }: Props) => {
  const [state, dispatch] = useReducer(Reducer, InitialState)

  const adjustReadingOption = useCallback(
    (option: ReadingOption, adjust: Adjustment) => {
      dispatch({ type: 'adjustReadingOption', option, adjustment: adjust })
    },
    [dispatch],
  )

  const setReadingOption = useCallback(
    (option: ReadingOption, value: number) => {
      dispatch({ type: 'setReadingOption', option, value })
    },
    [dispatch],
  )

  const toggleShowReadingOptions = useCallback(() => {
    dispatch({ type: 'toggleReadingOptions' })
  }, [dispatch])

  const setShowReadingOptions = useCallback(
    (show: boolean) => {
      dispatch({ type: 'setShowReadingOptions', show })
    },
    [dispatch],
  )

  const setReadingTextAlign = useCallback(
    (textAlign: TextAlign) => {
      dispatch({ type: 'setReadingAlign', textAlign })
    },
    [dispatch],
  )

  const selectReadingFont = useCallback(
    (font: Font) => {
      dispatch({ type: 'selectReadingFont', font })
    },
    [dispatch],
  )

  const resetReadingOptions = useCallback(() => {
    dispatch({ type: 'resetReadingOptions' })
  }, [dispatch])

  const setUITheme = useCallback(
    (theme: UITheme) => {
      dispatch({ type: 'setUITheme', theme })
    },
    [dispatch],
  )

  useEffect(() => {
    const fontFamily = getSetInitial('--reading-font-family') ?? FontDefinitions['Arial'].family
    const font = Object.values(FontDefinitions).find(d => d.family === fontFamily)?.name ?? 'Arial'
    const state: State = {
      readingOptions: {
        showOptions: false,
        font,
        fontSize: getSetInitialValue('--reading-font-size'),
        paragraphIndent: getSetInitialValue('--reading-paragraph-indent'),
        paragraphSpacing: getSetInitialValue('--reading-paragraph-spacing'),
        letterSpacing: getSetInitialValue('--reading-letter-spacing', 0),
        lineSpacing: getSetInitialValue('--reading-line-spacing'),
        wordSpacing: getSetInitialValue('--reading-word-spacing', 0),
        textAlign: (getSetInitial('--reading-text-align') as TextAlign) ?? 'left',
      },
      uiTheme: (getSetInitial('data-theme') as UITheme) ?? 'dark',
    }
    document.documentElement.setAttribute('data-theme', state.uiTheme)
    document.body.dataset.theme = state.uiTheme
    dispatch({ type: 'load', state })
  }, [])

  return (
    <OptionsContext.Provider
      value={{
        state,
        actions: {
          adjustReadingOption,
          setReadingOption,
          toggleShowReadingOptions,
          setReadingTextAlign,
          selectReadingFont,
          resetReadingOptions,
          setUITheme,
          setShowReadingOptions,
        },
      }}>
      {children}
    </OptionsContext.Provider>
  )
}
export default Provider
