/**
 * Parser incremental de Server-Sent Events para o Kiko.
 *
 * A API escreve cada pedaço como `data:<texto>\n\n`, sem espaço depois de `data:`,
 * então o texto NÃO é aparado (o espaço inicial pode fazer parte da resposta).
 * Várias linhas `data:` do mesmo evento são unidas com `\n` (o web une sem `\n`
 * e perde as quebras de linha).
 */
export interface SseParser {
  /** Recebe um pedaço decodificado do stream. */
  push(chunk: string): void;
  /** Processa o que sobrou no buffer quando o stream fecha. */
  flush(): void;
}

const DONE = '[DONE]';

export function createSseParser(onData: (text: string) => void): SseParser {
  let buffer = '';
  // Um "\r" no fim do pedaço pode ser a metade de um "\r\n".
  let pendingCR = false;

  const emit = (event: string) => {
    const lines = event.split('\n').filter((line) => line.startsWith('data:'));
    if (lines.length === 0) return;
    const text = lines.map((line) => line.slice(5)).join('\n');
    if (text && text !== DONE) onData(text);
  };

  return {
    push(chunk) {
      let text = (pendingCR ? '\r' : '') + chunk;
      pendingCR = text.endsWith('\r');
      if (pendingCR) text = text.slice(0, -1);
      buffer += text.replace(/\r\n?/g, '\n');
      let index = buffer.indexOf('\n\n');
      while (index !== -1) {
        emit(buffer.slice(0, index));
        buffer = buffer.slice(index + 2);
        index = buffer.indexOf('\n\n');
      }
    },
    flush() {
      if (pendingCR) buffer += '\n';
      if (buffer) emit(buffer);
      buffer = '';
      pendingCR = false;
    },
  };
}
