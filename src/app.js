// Configuração do Express. Fica separada do server.js para que os testes
// possam importar o app sem abrir uma porta.
const path = require('path');
const express = require('express');
const { traduzir, listarCategorias } = require('./services/tradutor');
const { validarMovimentacao } = require('./utils/texto');
const { version } = require('../package.json');

const app = express();

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Usado pelo deploy e pelo Nginx para saber se a aplicação está no ar.
app.get('/health', (req, res) => {
  res.json({ status: 'ok', versao: version });
});

app.get('/api/categorias', (req, res) => {
  res.json({ categorias: listarCategorias() });
});

app.post('/api/traduzir', (req, res) => {
  const movimentacao = req.body ? req.body.movimentacao : undefined;
  const validacao = validarMovimentacao(movimentacao);

  if (!validacao.valido) {
    return res.status(400).json({ erro: validacao.erro });
  }

  return res.json(traduzir(movimentacao));
});

// JSON malformado no corpo da requisição.
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido.' });
  }
  return next(err);
});

app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

module.exports = app;
