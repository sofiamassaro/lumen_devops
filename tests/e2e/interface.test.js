// Teste de interface com Selenium: sobe a aplicação numa porta livre,
// abre o Chrome em modo headless (sem janela) e usa a página como um
// usuário faria.
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const app = require('../../src/app');

jest.setTimeout(60000);

let server;
let driver;
let baseUrl;

beforeAll(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://localhost:${server.address().port}`;

  const opcoes = new chrome.Options().addArguments(
    '--headless=new',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1280,900',
  );
  const builder = new Builder().forBrowser('chrome').setChromeOptions(opcoes);

  // Opcional: caminho de um chromedriver específico. Sem essa variável, o
  // Selenium Manager encontra (ou baixa) o driver certo sozinho.
  if (process.env.CHROMEDRIVER_PATH) {
    builder.setChromeService(new chrome.ServiceBuilder(process.env.CHROMEDRIVER_PATH));
  }

  driver = await builder.build();
});

afterAll(async () => {
  if (driver) await driver.quit();
  if (server) await new Promise((resolve) => server.close(resolve));
});

describe('Interface do LUMEN (Selenium)', () => {
  test('a página abre com o título correto', async () => {
    await driver.get(baseUrl);
    const titulo = await driver.getTitle();
    expect(titulo).toContain('LUMEN');
  });

  test('traduz uma movimentação digitada pelo usuário', async () => {
    await driver.get(baseUrl);

    const campo = await driver.findElement(By.id('movimentacao'));
    await campo.sendKeys('Conclusos para sentença');
    await driver.findElement(By.id('btn-traduzir')).click();

    const resultado = await driver.findElement(By.id('resultado'));
    await driver.wait(until.elementIsVisible(resultado), 5000);

    const categoria = await driver.findElement(By.id('resultado-categoria')).getText();
    const texto = await driver.findElement(By.id('resultado-texto')).getText();

    expect(categoria.toLowerCase()).toBe('aguardando o juiz');
    expect(texto).toMatch(/decisão final/);
  });

  test('o botão de exemplo preenche o campo', async () => {
    await driver.get(baseUrl);
    await driver.findElement(By.css('[data-exemplo="Audiência designada"]')).click();

    const valor = await driver.findElement(By.id('movimentacao')).getAttribute('value');
    expect(valor).toBe('Audiência designada');
  });

  test('mostra erro quando o campo está vazio', async () => {
    await driver.get(baseUrl);
    await driver.findElement(By.id('btn-traduzir')).click();

    const erro = await driver.findElement(By.id('erro'));
    await driver.wait(until.elementIsVisible(erro), 5000);
    expect(await erro.getText()).toMatch(/digite/i);
  });
});
