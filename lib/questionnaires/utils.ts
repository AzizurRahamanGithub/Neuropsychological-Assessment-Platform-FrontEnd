
// src/lib/questionnaires/utils.ts

export function scoreFromLabel(label?: string): number {
  if (!label) return 0;

  const s = label.trim().toUpperCase();
  const letter = s.charAt(0);

  const map: Record<string, number> = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6 };
  return map[letter] ?? 0;
}


export function qKey(n: number) {
  return `q${n}`;
}
