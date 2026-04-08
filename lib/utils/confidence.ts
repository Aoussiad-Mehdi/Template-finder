export function confidenceLabel(score: number): 'High' | 'Medium' | 'Low' | 'Uncertain' {
  if (score >= 90) return 'High';
  if (score >= 70) return 'Medium';
  if (score >= 50) return 'Low';
  return 'Uncertain';
}
