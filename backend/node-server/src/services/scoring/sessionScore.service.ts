export interface ScoreBreakdownInput {
  correctness: number
  efficiency: number
  codeQuality: number
  designQuality: number
}

export function clampScore(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(100, Math.max(0, Math.round(value)))
}

export function normalizeBreakdown(input: Partial<ScoreBreakdownInput>): ScoreBreakdownInput {
  return {
    correctness: clampScore(input.correctness ?? 0),
    efficiency: clampScore(input.efficiency ?? 0),
    codeQuality: clampScore(input.codeQuality ?? 0),
    designQuality: clampScore(input.designQuality ?? 0),
  }
}

export function computeOverallScore(input: Partial<ScoreBreakdownInput>): {
  breakdown: ScoreBreakdownInput
  overallScore: number
} {
  const breakdown = normalizeBreakdown(input)

  const overallRaw =
    breakdown.correctness * 0.4 +
    breakdown.efficiency * 0.2 +
    breakdown.codeQuality * 0.2 +
    breakdown.designQuality * 0.2

  return {
    breakdown,
    overallScore: clampScore(overallRaw),
  }
}

export function average(values: number[]): number {
  if (!values.length) return 0
  const total = values.reduce((sum, value) => sum + value, 0)
  return clampScore(total / values.length)
}
