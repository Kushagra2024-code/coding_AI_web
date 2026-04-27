import { useState, useEffect, useCallback } from 'react'
import type { CheatingSignals } from '../types/api'

export function useCheatingDetection() {
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [windowBlurCount, setWindowBlurCount] = useState(0)
  const [pasteChars, setPasteChars] = useState(0)
  const [pasteCount, setPasteCount] = useState(0)

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setTabSwitchCount((prev) => prev + 1)
      }
    }

    const handleBlur = () => {
      setWindowBlurCount((prev) => prev + 1)
    }

    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData('text') || ''
      setPasteChars((prev) => prev + pastedText.length)
      setPasteCount((prev) => prev + 1)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    document.addEventListener('paste', handlePaste)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('paste', handlePaste)
    }
  }, [])

  const getSignals = useCallback((): CheatingSignals => {
    return {
      tabSwitchCount,
      windowBlurCount,
      pasteChars,
      pasteCount,
    }
  }, [tabSwitchCount, windowBlurCount, pasteChars, pasteCount])

  const resetSignals = useCallback(() => {
    setTabSwitchCount(0)
    setWindowBlurCount(0)
    setPasteChars(0)
    setPasteCount(0)
  }, [])

  return {
    signals: { tabSwitchCount, windowBlurCount, pasteChars, pasteCount },
    getSignals,
    resetSignals,
  }
}
