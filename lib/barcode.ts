export function ean13FromSeq(seq: number): string {
  const base = `20000${String(seq).padStart(7, "0")}`.slice(0, 12);
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(base[i]) * (i % 2 === 0 ? 1 : 3);
  return base + String((10 - (sum % 10)) % 10);
}
