const {
  normalizar,
  validarMovimentacao,
  TAMANHO_MAXIMO,
} = require('../../src/utils/texto');

describe('normalizar', () => {
  test('remove acentos e deixa em minúsculas', () => {
    expect(normalizar('Concluso para DECISÃO')).toBe('concluso para decisao');
  });

  test('colapsa espaços repetidos e remove espaços nas pontas', () => {
    expect(normalizar('   juntada    de   petição  ')).toBe('juntada de peticao');
  });

  test('converte valores que não são texto', () => {
    expect(normalizar(123)).toBe('123');
  });
});

describe('validarMovimentacao', () => {
  test('aceita um texto válido', () => {
    expect(validarMovimentacao('Juntada de petição')).toEqual({ valido: true });
  });

  test('rejeita texto vazio ou só com espaços', () => {
    expect(validarMovimentacao('   ').valido).toBe(false);
    expect(validarMovimentacao('').erro).toMatch(/digite/i);
  });

  test('rejeita valores que não são texto', () => {
    expect(validarMovimentacao(undefined).valido).toBe(false);
    expect(validarMovimentacao(42).erro).toMatch(/texto/i);
  });

  test('rejeita textos acima do tamanho máximo', () => {
    const grande = 'a'.repeat(TAMANHO_MAXIMO + 1);
    const resultado = validarMovimentacao(grande);
    expect(resultado.valido).toBe(false);
    expect(resultado.erro).toContain(String(TAMANHO_MAXIMO));
  });

  test('aceita exatamente o tamanho máximo', () => {
    expect(validarMovimentacao('a'.repeat(TAMANHO_MAXIMO)).valido).toBe(true);
  });
});
