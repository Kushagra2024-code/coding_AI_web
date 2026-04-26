export interface CheatingSignals {
  tabSwitchCount: number
  windowBlurCount: number
  pasteChars: number
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
  const pasteRisk = signals.pasteChars >= 200 ? clamp(Math.floor(signals.pasteChars / 40), 0, 25) : 0
  const fastSolveRisk = signals.solveTimeSeconds !== undefined && signals.solveTimeSeconds < 180 ? 20 : 0
  const similarityRisk = signals.similarityScore !== undefined ? clamp(Math.round(signals.similarityScore * 0.4), 0, 40) : 0

  const riskScore = clamp(tabRisk + blurRisk + pasteRisk + fastSolveRisk + similarityRisk, 0, 100)

  const flags: string[] = []
  if (signals.tabSwitchCount >= 3) flags.push('frequent_tab_switching')
  if (signals.windowBlurCount >= 4) flags.push('frequent_window_blur')
  if (signals.pasteChars >= 300) flags.push('large_paste_detected')
  if (signals.solveTimeSeconds !== undefined && signals.solveTimeSeconds < 180) flags.push('unusually_fast_solution')
  if ((signals.similarityScore ?? 0) >= 70) flags.push('high_code_similarity')

  const severity: 'low' | 'medium' | 'high' = riskScore >= 70 ? 'high' : riskScore >= 35 ? 'medium' : 'low'

  return {
    riskScore,
    severity,
    flags,
  }
}
