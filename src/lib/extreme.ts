export function pickExtremeIndices(
  exerciseCount: number,
  extremeCount: number
): Set<number> {
  const indices = new Set<number>();
  if (exerciseCount <= 1) return indices;

  const maxAttempts = 100;
  let attempts = 0;

  while (indices.size < Math.min(extremeCount, exerciseCount) && attempts < maxAttempts) {
    const idx = Math.floor(Math.random() * exerciseCount);
    let valid = true;
    for (const existing of indices) {
      if (Math.abs(existing - idx) <= 1) {
        valid = false;
        break;
      }
    }
    if (valid) {
      indices.add(idx);
    }
    attempts++;
  }

  // Fallback: if we couldn't find non-adjacent positions, just add any
  if (indices.size < Math.min(extremeCount, exerciseCount)) {
    for (let i = 0; i < exerciseCount && indices.size < extremeCount; i++) {
      indices.add(i);
    }
  }

  return indices;
}
