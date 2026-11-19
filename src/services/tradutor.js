const { normalizar } = require('../utils/texto');

const DICIONARIO = [
  {
    termos: ['transito em julgado', 'transitado em julgado'],
    categoria: 'Encerramento',
    traducao:
      'A decisão final do processo não pode mais ser contestada por recurso. O resultado agora é definitivo.',
  },
  {
    termos: ['concluso para sentenca', 'conclusos para sentenca'],
    categoria: 'Aguardando o juiz',
    traducao:
      'O processo está com o juiz para que ele dê a decisão final (sentença). Não há nada que você precise fazer agora.',
  },
  {
    termos: ['concluso para decisao', 'conclusos para decisao'],
    categoria: 'Aguardando o juiz',
    traducao:
      'O processo está com o juiz para que ele decida um pedido feito durante o andamento do caso.',
  },
  {
    termos: ['concluso para despacho', 'conclusos para despacho', 'concluso'],
    categoria: 'Aguardando o juiz',
    traducao:
      'O processo foi enviado ao juiz para que ele dê o próximo passo, como pedir documentos ou marcar uma audiência.',
  },
  {
    termos: ['sentenca', 'julgado procedente', 'julgado improcedente'],
    categoria: 'Decisão',
    traducao:
      'O juiz deu a decisão final sobre o caso. Seu advogado vai explicar o resultado e se cabe recurso.',
  },
  {
    termos: ['audiencia designada', 'designada audiencia', 'audiencia'],
    categoria: 'Agenda',
    traducao:
      'Foi marcada uma audiência, que é um encontro com o juiz. Seu advogado vai informar a data e se você precisa comparecer.',
  },
  {
    termos: ['citacao', 'citado', 'mandado de citacao'],
    categoria: 'Comunicação',
    traducao:
      'A outra parte foi (ou será) avisada oficialmente de que existe um processo contra ela.',
  },
  {
    termos: ['intimacao', 'intimado', 'intimada'],
    categoria: 'Comunicação',
    traducao:
      'Alguém do processo foi avisado oficialmente para tomar conhecimento de algo ou cumprir um prazo.',
  },
  {
    termos: ['juntada', 'peticao juntada', 'juntada de peticao'],
    categoria: 'Documentos',
    traducao:
      'Um novo documento ou pedido foi anexado ao processo.',
  },
  {
    termos: ['expedicao de mandado', 'mandado expedido', 'mandado'],
    categoria: 'Comunicação',
    traducao:
      'Foi emitida uma ordem do juiz para ser cumprida por um oficial de justiça.',
  },
  {
    termos: ['remessa ao tribunal', 'remetidos os autos', 'recurso'],
    categoria: 'Recurso',
    traducao:
      'O processo foi enviado para um tribunal superior, que vai analisar um recurso contra a decisão.',
  },
  {
    termos: ['arquivado', 'arquivamento', 'baixa definitiva'],
    categoria: 'Encerramento',
    traducao:
      'O processo foi encerrado e guardado. Não há mais andamentos previstos.',
  },
];

const NAO_RECONHECIDA =
  'Ainda não temos uma tradução automática para esta movimentação. Seu advogado vai revisar e explicar em breve.';

function traduzir(movimentacao) {
  const original = String(movimentacao).trim();
  const texto = normalizar(original);

  const regra = DICIONARIO.find((item) =>
    item.termos.some((termo) => texto.includes(termo)),
  );

  if (!regra) {
    return {
      original,
      traducao: NAO_RECONHECIDA,
      categoria: 'Revisão do advogado',
      reconhecida: false,
    };
  }

  return {
    original,
    traducao: regra.traducao,
    categoria: regra.categoria,
    reconhecida: true,
  };
}

function listarCategorias() {
  return [...new Set(DICIONARIO.map((item) => item.categoria))].sort();
}

module.exports = { traduzir, listarCategorias, DICIONARIO, NAO_RECONHECIDA };
