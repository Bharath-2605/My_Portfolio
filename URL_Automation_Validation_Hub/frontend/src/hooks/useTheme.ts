import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'uvh-theme'

function systemTheme(): Theme {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'dark' || stored === 'light') return stored
  } catch {
    /* ignore */
  }
  return systemTheme()
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const initial = readTheme()
    applyTheme(initial)
    return initial
  })

  useEffect(() => {
    applyTheme(theme)
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))

  return { theme, toggleTheme }
}
