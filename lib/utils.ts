import { faGlobeAmericas, faPenFancy, faSmile } from '@fortawesome/free-solid-svg-icons'
import { AccessTier } from '../app/api/patreon/types'

export const isNotEmpty = <T>(item: T | undefined | null): item is T => {
  return item !== undefined && item !== null
}

export const classes = (...classNames: (string | undefined | null)[]) => classNames.filter(isNotEmpty).join(' ')

/**
 * Takes an array and groups items into sub-arrays at the given size
 * Last group may contain less than the group size.
 */
export const groupArray = <T>(size: number, array: T[]): T[][] => {
  let arr: T[][] = []
  let cArr: T[] = []
  for (const item of array) {
    cArr.push(item)
    if (cArr.length === size) {
      arr.push(cArr)
      cArr = []
    }
  }
  if (cArr.length > 0) {
    arr.push(cArr)
  }
  return arr
}

export type ObjectKeys<T> = T extends object
  ? (keyof T)[]
  : T extends number
  ? []
  : T extends Array<any> | string
  ? string[]
  : never

export const TypedKeys = <T extends object>(object: T): ObjectKeys<T> => {
  return Object.keys(object) as ObjectKeys<T>
}

export interface ObjectConstructor {
  keys<T>(o: T): ObjectKeys<T>
}

export const userCanAccessTier = (user: { patreonTier?: string } | undefined, tier: AccessTier): boolean => {
  if (!user) {
    return tier === 'free'
  }
  switch (tier) {
    case 'free':
      return true
    case 'story':
      return user.patreonTier === 'story' || user.patreonTier === 'world'
    case 'world':
      return user.patreonTier === 'world'
    default:
      return false
  }
}

export const TierData = {
  free: {
    title: 'Free',
    icon: faSmile,
  },
  story: {
    title: 'Story',
    icon: faPenFancy,
  },
  world: {
    title: 'World',
    icon: faGlobeAmericas,
  },
}
