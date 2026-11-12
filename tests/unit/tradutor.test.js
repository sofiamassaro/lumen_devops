const {
  traduzir,
  listarCategorias,
  NAO_RECONHECIDA,
} = require('../../src/services/tradutor');

describe('traduzir', () => {
  test('traduz "Conclusos para sentença" como aguardando decisão final', () => {
    const resultado = traduzir('Conclusos para sentença');
    expect(resultado.reconhecida).toBe(true);
    expect(resultado.categoria).toBe('Aguardando o juiz');
    expect(resultado.traducao).toMatch(/decisão final/);
  });

  test('não confunde "concluso para sentença" com o "concluso" genérico', () => {
    const sentenca = traduzir('Concluso para sentença').traducao;
    const despacho = traduzir('Concluso para despacho').traducao;
    expect(sentenca).not.toBe(despacho);
  });

  test('ignora acentos e maiúsculas', () => {
    const comAcento = traduzir('AUDIÊNCIA DESIGNADA');
    const semAcento = traduzir('audiencia designada');
    expect(comAcento.traducao).toBe(semAcento.traducao);
    expect(comAcento.categoria).toBe('Agenda');
  });

  test('reconhece o termo no meio de um texto maior', () => {
    const resultado = traduzir('12/11/2026 - Juntada de petição de manifestação');
    expect(resultado.categoria).toBe('Documentos');
  });

  test('trânsito em julgado tem prioridade sobre "julgado"', () => {
    expect(traduzir('Certificado o trânsito em julgado').categoria).toBe('Encerramento');
  });

  test('preserva o texto original sem espaços nas pontas', () => {
    expect(traduzir('  Intimação  ').original).toBe('Intimação');
  });

  test('retorna aviso de revisão quando não reconhece a movimentação', () => {
    const resultado = traduzir('Ato ordinatório praticado');
    expect(resultado.reconhecida).toBe(false);
    expect(resultado.traducao).toBe(NAO_RECONHECIDA);
    expect(resultado.categoria).toBe('Revisão do advogado');
  });
});

describe('listarCategorias', () => {
  test('retorna categorias sem repetição e em ordem alfabética', () => {
    const categorias = listarCategorias();
    expect(new Set(categorias).size).toBe(categorias.length);
    expect([...categorias].sort()).toEqual(categorias);
    expect(categorias).toContain('Aguardando o juiz');
  });
});
