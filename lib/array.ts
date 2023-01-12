declare global {
  interface Array<T> {
    joined<T>(seperator: T | ((idx: number) => T)): T[]
    some_method(): this
  }
}

const isFunction = (value: any): value is Function => {
  return typeof value === 'function'
}

Array.prototype.joined = function <T>(this: T[], seperator: T | ((idx: number) => T)): T[] {
  if (this.length <= 1) return [...this]
  const joined: T[] = [this[0]]
  let idx = 1
  for (const item of this.slice(1)) {
    joined.push(isFunction(seperator) ? seperator(idx) : seperator)
    joined.push(item)
    idx++
  }
  return joined
}

export {}
