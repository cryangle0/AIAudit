import { useCallback, useState } from 'react'
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  clearSettings
} from '../core/settingsDefaults.js'

export function useSettings() {
  const [settings, setSettings] = useState(() => loadSettings())

  // updater(prev) => next，或者直接传 partial 对象
  const updateSettings = useCallback(updater => {
    setSettings(prev => {
      const next = typeof updater === 'function'
        ? updater(prev)
        : { ...prev, ...updater }
      saveSettings(next)
      return next
    })
  }, [])

  const resetSettings = useCallback(() => {
    clearSettings()
    setSettings({ ...DEFAULT_SETTINGS })
  }, [])

  return [settings, updateSettings, resetSettings]
}
