// Lógica da página: envia a movimentação para a API e mostra a tradução.
(function () {
  const form = document.getElementById('form-traducao');
  const campo = document.getElementById('movimentacao');
  const erro = document.getElementById('erro');
  const resultado = document.getElementById('resultado');
  const categoria = document.getElementById('resultado-categoria');
  const texto = document.getElementById('resultado-texto');

  function mostrarErro(mensagem) {
    resultado.hidden = true;
    erro.textContent = mensagem;
    erro.hidden = false;
  }

  function mostrarResultado(dados) {
    erro.hidden = true;
    categoria.textContent = dados.categoria;
    texto.textContent = dados.traducao;
    resultado.hidden = false;
  }

  document.querySelectorAll('[data-exemplo]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      campo.value = chip.dataset.exemplo;
      campo.focus();
    });
  });

  form.addEventListener('submit', async function (evento) {
    evento.preventDefault();

    if (campo.value.trim() === '') {
      mostrarErro('Digite uma movimentação processual.');
      return;
    }

    try {
      const resposta = await fetch('/api/traduzir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movimentacao: campo.value }),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        mostrarErro(dados.erro || 'Não foi possível traduzir.');
        return;
      }
      mostrarResultado(dados);
    } catch {
      mostrarErro('Falha de conexão com o servidor.');
    }
  });
})();
