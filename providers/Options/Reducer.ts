import { Font, FontDefinitions, GlobalVariable, Global, Storage, UITheme } from '../../lib/globals'
import { ReducerAction } from '../../lib/types'
import { Adjustment, ReadingOption, ReadingOptions, State, TextAlign } from './Types'

type ReadingParam = {
  step: number
  max: number
  min: number
}

export const ReadingParams: { [key in ReadingOption]: ReadingParam } = {
  fontSize: { step: 0.1, max: 4, min: 0.1 },
  paragraphIndent: { step: 0.5, max: 10, min: 0 },
  paragraphSpacing: { step: 0.5, max: 10, min: 0 },
  lineSpacing: { step: 0.05, max: 3, min: 0 },
  letterSpacing: { step: 0.01, max: 2, min: 0 },
  wordSpacing: { step: 0.02, max: 4, min: 0 },
  readingWidth: { step: 5, max: 160, min: 10 },
}

export const BaseDependent: ReadingOption[] = ['paragraphIndent', 'paragraphSpacing', 'lineSpacing']

const ReadingGlobals: { [key in ReadingOption]: GlobalVariable } = {
  fontSize: '--reading-font-size',
  paragraphIndent: '--reading-paragraph-indent',
  paragraphSpacing: '--reading-paragraph-spacing',
  lineSpacing: '--reading-line-spacing',
  letterSpacing: '--reading-letter-spacing',
  wordSpacing: '--reading-word-spacing',
  readingWidth: '--max-content-width',
}

const clamp = (value: number, min: number, max: number) => {
  if (value < min) {
    return min
  } else if (value > max) {
    return max
  } else {
    return value
  }
}

const adjust = (value: number, param: ReadingParam, adjustment: Adjustment): number => {
  let adjust = adjustment === 'increase' ? (value += param.step) : (value -= param.step)
  let rounded = Math.round(adjust * 100) / 100
  return clamp(rounded, param.min, param.max)
}

export type Action =
  | ReducerAction<'load', { state: State }>
  | ReducerAction<'adjustReadingOption', { option: ReadingOption; adjustment: Adjustment }>
  | ReducerAction<'setReadingOption', { option: ReadingOption; value: number }>
  | ReducerAction<'resetReadingOptions'>
  | ReducerAction<'setReadingAlign', { textAlign: TextAlign }>
  | ReducerAction<'toggleReadingOptions'>
  | ReducerAction<'setShowReadingOptions', { show: boolean }>
  | ReducerAction<'selectReadingFont', { font: Font }>
  | ReducerAction<'setUITheme', { theme: UITheme }>

const Reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'load':
      return action.state
    case 'resetReadingOptions': {
      const readingOptions: ReadingOptions = {
        font: 'Helvetica',
        showOptions: true,
        fontSize: 1,
        paragraphIndent: 2,
        paragraphSpacing: 0,
        lineSpacing: 1.2,
        letterSpacing: 0,
        wordSpacing: 0,
        textAlign: 'left',
        readingWidth: 50,
      }
      Global.set('--reading-font-family', readingOptions.font)
      Global.set('--reading-text-align', readingOptions.textAlign)
      Global.setValue('--reading-font-size', readingOptions.fontSize)
      Global.setValue('--reading-paragraph-indent', readingOptions.paragraphIndent)
      Global.setValue('--reading-paragraph-spacing', readingOptions.paragraphSpacing)
      Global.setValue('--reading-line-spacing', readingOptions.lineSpacing)
      Global.setValue('--reading-letter-spacing', readingOptions.letterSpacing)
      Global.setValue('--reading-word-spacing', readingOptions.wordSpacing)
      Global.setValue('--max-content-width', readingOptions.readingWidth)

      Storage.set('--reading-font-family', readingOptions.font)
      Storage.set('--reading-text-align', readingOptions.textAlign)
      Storage.setValue('--reading-font-size', readingOptions.fontSize)
      Storage.setValue('--reading-paragraph-indent', readingOptions.paragraphIndent)
      Storage.setValue('--reading-paragraph-spacing', readingOptions.paragraphSpacing)
      Storage.setValue('--reading-line-spacing', readingOptions.lineSpacing)
      Storage.setValue('--reading-letter-spacing', readingOptions.letterSpacing)
      Storage.setValue('--reading-word-spacing', readingOptions.wordSpacing)
      Storage.setValue('--max-content-width', readingOptions.readingWidth)

      return { ...state, readingOptions }
    }
    case 'setUITheme':
      Global.set('data-theme', action.theme)
      Storage.set('data-theme', action.theme)
      document.documentElement.setAttribute('data-theme', action.theme)
      document.body.dataset.theme = action.theme
      return {
        ...state,
        uiTheme: action.theme,
      }
    case 'setReadingAlign':
      Global.set('--reading-text-align', action.textAlign)
      Storage.set('--reading-text-align', action.textAlign)
      return {
        ...state,
        readingOptions: {
          ...state.readingOptions,
          textAlign: action.textAlign,
        },
      }
    case 'toggleReadingOptions':
      return {
        ...state,
        readingOptions: {
          ...state.readingOptions,
          showOptions: !state.readingOptions.showOptions,
        },
      }
    case 'setShowReadingOptions':
      return {
        ...state,
        readingOptions: {
          ...state.readingOptions,
          showOptions: action.show,
        },
      }

    case 'setReadingOption':
    case 'adjustReadingOption': {
      const value =
        action.type === 'adjustReadingOption'
          ? adjust(state.readingOptions[action.option], ReadingParams[action.option], action.adjustment)
          : clamp(action.value, ReadingParams[action.option].min, ReadingParams[action.option].max)
      const base = action.option === 'fontSize' ? value : state.readingOptions.fontSize
      if (action.option === 'fontSize') {
        Global.setValue(ReadingGlobals[action.option], value)
        //All dependent options need to be updated since the base (fontSize) has changed
        for (const opt of BaseDependent) {
          const baseAdjusted = state.readingOptions[opt] * base
          Global.setValue(ReadingGlobals[opt], baseAdjusted)
        }
      } else {
        const baseAdjusted = value * base
        Global.setValue(ReadingGlobals[action.option], baseAdjusted)
      }
      Storage.setValue(ReadingGlobals[action.option], value)
      const readingOptions = {
        ...state.readingOptions,
        [action.option]: value,
      }
      return { ...state, readingOptions }
    }
    case 'selectReadingFont': {
      const family = FontDefinitions[action.font].family
      Global.set('--reading-font-family', family)
      Storage.set('--reading-font-family', family)
      const readingOptions = {
        ...state.readingOptions,
        font: action.font,
      }
      return { ...state, readingOptions }
    }
  }
}
export default Reducer
