const request = require('supertest');
const app = require('../../src/app');
const { version } = require('../../package.json');

describe('Rotas HTTP', () => {
  test('GET / entrega a página do LUMEN', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('LUMEN');
  });

  test('GET /health informa status e versão', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', versao: version });
  });

  test('GET /api/categorias lista as categorias', async () => {
    const res = await request(app).get('/api/categorias');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.categorias)).toBe(true);
  });

  test('POST /api/traduzir devolve a tradução', async () => {
    const res = await request(app)
      .post('/api/traduzir')
      .send({ movimentacao: 'Juntada de petição' });
    expect(res.status).toBe(200);
    expect(res.body.categoria).toBe('Documentos');
  });

  test('POST /api/traduzir sem movimentação retorna 400', async () => {
    const res = await request(app).post('/api/traduzir').send({});
    expect(res.status).toBe(400);
    expect(res.body.erro).toBeDefined();
  });

  test('POST /api/traduzir com JSON malformado retorna 400', async () => {
    const res = await request(app)
      .post('/api/traduzir')
      .set('Content-Type', 'application/json')
      .send('{"movimentacao":');
    expect(res.status).toBe(400);
    expect(res.body.erro).toBe('JSON inválido.');
  });

  test('rota inexistente retorna 404', async () => {
    const res = await request(app).get('/nao-existe');
    expect(res.status).toBe(404);
  });
});
