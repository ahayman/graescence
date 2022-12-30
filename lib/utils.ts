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
