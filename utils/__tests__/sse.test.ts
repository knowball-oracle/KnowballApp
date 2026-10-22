import { createSseParser } from '../sse';

function collect(chunks: string[], flush = true): string[] {
  const out: string[] = [];
  const parser = createSseParser((t) => out.push(t));
  chunks.forEach((c) => parser.push(c));
  if (flush) parser.flush();
  return out;
}

describe('createSseParser', () => {
  it('emite um evento por bloco data:', () => {
    expect(collect(['data:Olá\n\ndata:mundo\n\n'])).toEqual(['Olá', 'mundo']);
  });

  it('não apara o espaço depois de data: (a API não manda espaço)', () => {
    expect(collect(['data: Olá\n\ndata:  tudo bem\n\n'])).toEqual([' Olá', '  tudo bem']);
  });

  it('une várias linhas data: do mesmo evento com \\n', () => {
    expect(collect(['data:Linha 1\ndata:Linha 2\ndata:\ndata:Linha 4\n\n'])).toEqual([
      'Linha 1\nLinha 2\n\nLinha 4',
    ]);
  });

  it('junta evento dividido entre leituras', () => {
    expect(collect(['da', 'ta:Kik', 'o\n', '\ndata:fim\n\n'])).toEqual(['Kiko', 'fim']);
  });

  it('aceita \\r\\n, inclusive dividido entre leituras', () => {
    expect(collect(['data:a\r\n\r', '\ndata:b\r\n\r\n'])).toEqual(['a', 'b']);
  });

  it('ignora [DONE], comentários e linhas sem data:', () => {
    expect(collect([': ping\n\nevent:msg\ndata:oi\n\ndata:[DONE]\n\n'])).toEqual(['oi']);
  });

  it('emite o que sobrou no flush quando o stream fecha sem \\n\\n', () => {
    expect(collect(['data:último'], false)).toEqual([]);
    expect(collect(['data:último'])).toEqual(['último']);
  });
});
