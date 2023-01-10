import { useCallback, useRef, useState } from 'react'

/**
 * Set State action can either be the State, or
 * a function that takes prior state and returns new state
 */
type SetStateAction<S> = S | ((prior: S) => S)

/**
 * Set State action is the function returned by the useStateDebouncer function
 * to allow updating stored state.
 */
type SetState<State> = (action: SetStateAction<State>) => void

/**
 * Typescript has a weird issue with using `f === 'function'` in a conditional.
 * This fixes that (also makes it more concise).
 */
function isFunction<T>(f: T | ((prior: T) => T)): f is (prior: T) => T {
  return typeof f === 'function'
}

/**
 * A useStateDebouncer works similar to a regular setState, except it returns an additional
 * state values, which is the debounced state.
 * The debounce will always update the latest state. The resolved state will only update after the debounceMs
 * delay specified after the last update. In other words, sequential updates reset the timer.
 * @param initialState - Defines the initial state used.
 * @param debounceMs - Defines the delay between the _last_ update and when resolvedState will be set.
 * @returns [
 *   ResolvedState, //The latest Debounced state update
 *   LatestState,  //The latest state (works same as SetState)
 *   SetState, //Function to update state
 * ]
 */
export const useStateDebouncer = <State>(
  initialState: State,
  debounceMs: number,
): [
  State, //Resolved
  State, //Latest
  SetState<State>,
] => {
  const [resolvedState, setResolvedState] = useState(initialState)
  const [latestState, setLatestState] = useState(initialState)
  const latestRef = useRef(initialState)
  const timerRef = useRef<NodeJS.Timeout>()

  const debounceSetState: SetState<State> = useCallback(
    (action: SetStateAction<State>) => {
      const newState = isFunction(action) ? action(latestRef.current) : action
      latestRef.current = newState
      setLatestState(newState)
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
      timerRef.current = setTimeout(() => setResolvedState(latestRef.current), debounceMs)
      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }
      }
    },
    [debounceMs],
  )

  return [resolvedState, latestState, debounceSetState]
}
