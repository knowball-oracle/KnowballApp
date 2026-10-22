import { ApiError, MESSAGES, isClientError, parseApiError } from '../parseApiError';

const res = (status: number, body: string, contentType = 'text/plain') => ({ status, body, contentType });

describe('parseApiError', () => {
  it('texto puro vira mensagem', () => {
    const e = parseApiError(res(400, 'Código inválido.'));
    expect(e).toBeInstanceOf(ApiError);
    expect(e.kind).toBe('validation');
    expect(e.message).toBe('Código inválido.');
  });

  it('string JSON (texto com content-type json) vira mensagem', () => {
    const e = parseApiError(res(409, '"Não é possível avançar o status"', 'application/json'));
    expect(e.kind).toBe('conflict');
    expect(e.message).toBe('Não é possível avançar o status');
  });

  it('mapa de validação vira fieldErrors', () => {
    const e = parseApiError(res(400, JSON.stringify({ name: 'Nome obrigatório', email: 'E-mail inválido' })));
    expect(e.kind).toBe('validation');
    expect(e.fieldErrors).toEqual({ name: 'Nome obrigatório', email: 'E-mail inválido' });
    expect(e.message).toBe('Nome obrigatório');
  });

  it('ProblemDetail usa detail', () => {
    const body = JSON.stringify({ type: 'about:blank', title: 'Conflict', status: 409, detail: 'Email já cadastrado: a@b.com' });
    const e = parseApiError(res(409, body, 'application/problem+json'));
    expect(e.kind).toBe('conflict');
    expect(e.message).toBe('Email já cadastrado: a@b.com');
  });

  it('corpo vazio usa a mensagem do status', () => {
    expect(parseApiError(res(401, '')).message).toBe(MESSAGES.byStatus[401]);
    expect(parseApiError(res(403, '')).kind).toBe('forbidden');
    expect(parseApiError(res(404, '  ')).kind).toBe('notFound');
  });

  it('login errado (500 Bad credentials) vira "E-mail ou senha inválidos."', () => {
    expect(parseApiError(res(500, 'Erro inesperado: Bad credentials')).message).toBe(MESSAGES.badCredentials);
    const pt = parseApiError(res(500, 'Erro inesperado: Usuário inexistente ou senha inválida'));
    expect(pt.kind).toBe('unauthorized');
    expect(pt.message).toBe(MESSAGES.badCredentials);
  });

  it('tira o prefixo "Erro inesperado: "', () => {
    const e = parseApiError(res(500, 'Erro inesperado: Apenas denúncias resolvidas podem ser excluídas.'));
    expect(e.kind).toBe('forbidden');
    expect(e.message).toBe('Apenas denúncias resolvidas podem ser excluídas.');
  });

  it('erro de FK vira "existem registros vinculados"', () => {
    const e = parseApiError(res(500, 'Erro inesperado: could not execute statement [ORA-02292: integrity constraint violated]'));
    expect(e.kind).toBe('conflict');
    expect(e.message).toBe(MESSAGES.linkedRecords);
  });

  it('ruído interno do Spring vira mensagem genérica', () => {
    expect(parseApiError(res(500, 'Erro inesperado: null')).message).toBe(MESSAGES.byStatus[500]);
    expect(parseApiError(res(500, 'Erro inesperado: No static resource foo.')).message).toBe(MESSAGES.byStatus[500]);
    expect(parseApiError(res(502, '<html>Bad gateway</html>')).message).toBe(MESSAGES.byStatus[500]);
  });

  it('JSON inválido enviado vira mensagem amigável', () => {
    expect(parseApiError(res(400, 'Erro ao ler JSON: Unexpected character')).message).toBe(MESSAGES.invalidJson);
  });

  it('falha de rede e timeout', () => {
    expect(parseApiError(new TypeError('Network request failed')).kind).toBe('network');
    const abort = new Error('Aborted');
    abort.name = 'AbortError';
    expect(parseApiError(abort).kind).toBe('timeout');
  });

  it('ApiError passa direto e isClientError separa 4xx', () => {
    const e = new ApiError('validation', 400, 'x');
    expect(parseApiError(e)).toBe(e);
    expect(isClientError(e)).toBe(true);
    expect(isClientError(new ApiError('server', 500, 'x'))).toBe(false);
    expect(isClientError(new ApiError('network', 0, 'x'))).toBe(false);
  });
});
