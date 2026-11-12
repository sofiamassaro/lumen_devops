// Funções utilitárias de texto, usadas pelo tradutor e pela validação.

/**
 * Remove acentos, deixa minúsculo e colapsa espaços.
 * "  Concluso para DECISÃO " -> "concluso para decisao"
 */
function normalizar(texto) {
  return String(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const TAMANHO_MAXIMO = 500;

/**
 * Valida a movimentação enviada pelo usuário.
 * Retorna { valido: true } ou { valido: false, erro: 'mensagem' }.
 */
function validarMovimentacao(texto) {
  if (typeof texto !== 'string') {
    return { valido: false, erro: 'Informe a movimentação como texto.' };
  }
  const limpo = texto.trim();
  if (limpo.length === 0) {
    return { valido: false, erro: 'Digite uma movimentação processual.' };
  }
  if (limpo.length > TAMANHO_MAXIMO) {
    return {
      valido: false,
      erro: `A movimentação deve ter no máximo ${TAMANHO_MAXIMO} caracteres.`,
    };
  }
  return { valido: true };
}

module.exports = { normalizar, validarMovimentacao, TAMANHO_MAXIMO };
