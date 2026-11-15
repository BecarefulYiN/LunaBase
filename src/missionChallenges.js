// Game-only patterns and frequencies; not real mission specifications.
export function createScannerSequence(random = Math.random) {
  const colors = ['blue', 'amber', 'mint'];
  return Array.from({ length: 4 }, () => colors[Math.floor(random() * colors.length)]);
}
export function createSignalChallenge(random = Math.random) {
  const targets = Array.from({ length: 2 }, () => (4 + Math.floor(random() * 13)) * 5);
  const initial = targets.map(target => {
    const choices = Array.from({length: 21}, (_, i) => i * 5).filter(value => Math.abs(value - target) >= 15 && Math.abs(value - target) <= 35);
    return choices[Math.floor(random() * choices.length)];
  });
  return { targets, initial };
}
