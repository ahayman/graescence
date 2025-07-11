import { Storage } from '../../lib/globals'
import { ReducerAction } from '../../lib/types'
import { PopoverContent, State } from './Types'

type Action = ReducerAction<'setPopover', { content?: PopoverContent }> | ReducerAction<'toggleFullScreen', {}>

const Reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'setPopover':
      return { ...state, popover: action.content }
    case 'toggleFullScreen': {
      const fullScreen = !state.fullScreen
      Storage.set('--full-screen', fullScreen ? 'true' : 'false')
      return { ...state, fullScreen }
    }
  }
}
export default Reducer
