export interface CheatingSignals {
  tabSwitchCount: number
  windowBlurCount: number
  pasteChars: number
  pasteCount: number
  solveTimeSeconds?: number
  similarityScore?: number
}

export interface CheatingAssessment {
  riskScore: number
  severity: 'low' | 'medium' | 'high'
  flags: string[]
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function assessCheatingRisk(signals: CheatingSignals): CheatingAssessment {
  const tabRisk = clamp(signals.tabSwitchCount, 0, 10) * 8
  const blurRisk = clamp(signals.windowBlurCount, 0, 12) * 5
  const pasteRisk = signals.pasteChars >= 100 ? clamp(Math.floor(signals.pasteChars / 30), 0, 30) : 0
  const pasteCountRisk = clamp(signals.pasteCount, 0, 3) * 10
  const fastSolveRisk = signals.solveTimeSeconds !== undefined && signals.solveTimeSeconds < 120 ? 30 : 0
  const similarityRisk = signals.similarityScore !== undefined ? clamp(Math.round(signals.similarityScore * 0.5), 0, 50) : 0

  const riskScore = clamp(tabRisk + blurRisk + pasteRisk + pasteCountRisk + fastSolveRisk + similarityRisk, 0, 100)

  const flags: string[] = []
  if (signals.tabSwitchCount >= 2) flags.push('frequent_tab_switching')
  if (signals.windowBlurCount >= 3) flags.push('frequent_window_blur')
  if (signals.pasteChars >= 150) flags.push('large_paste_detected')
  if (signals.pasteCount >= 1) flags.push('paste_detected')
  if (signals.solveTimeSeconds !== undefined && signals.solveTimeSeconds < 60) flags.push('unusually_fast_solution')
  if ((signals.similarityScore ?? 0) >= 60) flags.push('high_code_similarity')

  const severity: 'low' | 'medium' | 'high' = riskScore >= 70 ? 'high' : riskScore >= 30 ? 'medium' : 'low'

  return {
    riskScore,
    severity,
    flags,
  }
}
