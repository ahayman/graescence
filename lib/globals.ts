export type GlobalVariable =
  | '--reading-font-size'
  | '--reading-paragraph-spacing'
  | '--reading-paragraph-indent'
  | '--reading-line-spacing'
  | '--reading-letter-spacing'
  | '--reading-word-spacing'
  | '--reading-text-align'
  | '--reading-font-family'
  | '--max-content-width'
  | 'data-theme'

export type StorageVariable = GlobalVariable | '--current-chapter-id' | '--chapter-progress'

export type UITheme = 'dark' | 'light'

export const Fonts = [
  'Arial',
  'Verdana',
  'Helvetica',
  'AmericanTypewriter',
  'Baskerville',
  'TimesNewRoman',
  'Georgia',
  'Garamond',
  'CourierNew',
  // 'Monaco',
] as const
export type Font = (typeof Fonts)[number]

export type FontDef = {
  title: string
  name: Font
  family: string
}

export const FontDefinitions: { [key in Font]: FontDef } = {
  Arial: { name: 'Arial', title: 'Arial', family: 'Arial, sans-serif' },
  Verdana: { name: 'Verdana', title: 'Verdana', family: 'Verdana, sans-serif' },
  Helvetica: { name: 'Helvetica', title: 'Helvetica', family: 'Helvetica, sans-serif' },
  Baskerville: { name: 'Baskerville', title: 'Baskerville', family: 'Baskerville, serif' },
  Garamond: { name: 'Garamond', title: 'Garamond', family: 'Garamond, serif' },
  Georgia: { name: 'Georgia', title: 'Georgia', family: 'Georgia, serif' },
  TimesNewRoman: { name: 'TimesNewRoman', title: 'Times New Roman', family: "'Times New Roman', serif" },
  AmericanTypewriter: { name: 'AmericanTypewriter', title: 'Typewriter', family: "'American Typewriter', serif" },
  CourierNew: { name: 'CourierNew', title: 'Courier New', family: "'Courier New', monospace" },
  // Monaco: { name: 'Monaco', title: 'Monaco', family: 'Monaco, monospace' },
}

const extractValue = (variable: string | undefined, defaultValue: number): number => {
  if (!variable) {
    return defaultValue
  }
  const match = variable.match(/^\d+\.\d+|^\d+|^\.\d+/)?.[0]
  if (!match) {
    return defaultValue
  }
  const value = Number.parseFloat(match)
  if (isNaN(value)) {
    return defaultValue
  }
  return value
}

export const Global = {
  get: (name: GlobalVariable) => {
    return getComputedStyle(document.documentElement).getPropertyValue(name)
  },
  set: (name: GlobalVariable, value: string) => {
    document.documentElement.style.setProperty(name, value)
  },
  getValue: (name: GlobalVariable, defaultValue: number = 1) => {
    const variable = getComputedStyle(document.documentElement).getPropertyValue(name)
    return extractValue(variable, defaultValue)
  },
  setValue: (name: GlobalVariable, value: number) => {
    document.documentElement.style.setProperty(name, `${value}rem`)
  },
}

export const Storage = {
  get: (name: StorageVariable) => {
    return localStorage.getItem(name) ?? undefined
  },
  set: (name: StorageVariable, value?: string) => {
    if (value) {
      localStorage.setItem(name, value)
    } else {
      localStorage.removeItem(name)
    }
  },
  getValue: (name: StorageVariable, defaultValue: number = 1) => {
    let variable = localStorage.getItem(name) ?? undefined
    return extractValue(variable, defaultValue)
  },
  setValue: (name: StorageVariable, value: number) => {
    localStorage.setItem(name, `${value}`)
  },
}
