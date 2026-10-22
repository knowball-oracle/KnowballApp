/** Mesma lógica de `barcodeBars` do web (report-detail): 44 larguras de 1 a 4 px. */
export function barcodeBars(protocol: string): number[] {
  const source = protocol || 'KNOWBALL';
  const bars: number[] = [];
  for (let i = 0; i < 44; i++) {
    const charCode = source.charCodeAt(i % source.length);
    bars.push(((charCode + i * 7) % 4) + 1);
  }
  return bars;
}

/** Opacidade da barra pela largura, como no web. */
export function barOpacity(width: number): number {
  if (width === 1) return 0.45;
  if (width === 2) return 0.65;
  return 0.9;
}
