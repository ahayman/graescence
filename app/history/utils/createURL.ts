export const createURL = (base: string, params?: Record<string, unknown> | URLSearchParams) => {
  if (!params) return base

  if (params instanceof URLSearchParams) {
    return `${base}?${params.toString()}`
  } else {
    const newParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      newParams.append(key, String(value))
    })
    return `${base}?${newParams.toString()}`
  }
}
