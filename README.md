# LUMEN - Projeto N3 DevOps

Avaliação N3 da disciplina **Ferramentas de Implantação Contínua - DevOps** (ADS UNICESUSC, Prof. Joe Jonas Vogel).

O LUMEN traduz movimentações processuais ("Conclusos para sentença", "Juntada de petição"...) para linguagem simples, para o cliente de um advogado entender o andamento do seu processo. Esta é uma versão MVP do projeto do PMI, feita em Node.js/Express, sem banco de dados, para focar no pipeline de DevOps.

## Como os requisitos da N3 foram atendidos

| Requisito | Onde está |
|---|---|
| Branch `develop` | criada no passo 2 do guia abaixo |
| Branches de feature | `feature/*`, uma por funcionalidade (passo 8) |
| Workflow de CI + Continuous Delivery | `.github/workflows/ci.yml` |
| Análise de código estático | job `analise-estatica` (ESLint) |
| Cobertura | job `testes-unidade` (Jest `--coverage`, mínimo de 80%, relatório salvo como artefato) |
| Testes de unidade | `tests/unit/` (rodam no job `testes-unidade`) |
| Teste de interface com Selenium | `tests/e2e/interface.test.js` (job `teste-interface`) |
| Workflow de Continuous Deployment na EC2 | `.github/workflows/deploy.yml` |
| Aplicação Node.js | `src/` (API Express) e `public/` (página) |

## O fluxo completo

```
feature/xyz --PR--> develop --CI--> Delivery (merge automático na main) --Deploy--> Docker Hub --> EC2
```

1. Você faz commit numa branch `feature/...` e abre um **pull request para a `develop`**.
2. O **CI** roda no PR: ESLint, testes de unidade com cobertura e teste Selenium.
3. Ao fazer o merge do PR, o CI roda de novo na `develop` e, se tudo passar, o job **Delivery** faz o merge da `develop` na `main`.
4. O push na `main` dispara o **Deploy**: gera a imagem Docker, envia ao Docker Hub, entra na EC2 por SSH e reinicia o container.
5. A aplicação atualizada aparece em `http://IP_DA_EC2`.

## Estrutura

```
lumen-devops/
├── .github/workflows/
│   ├── ci.yml                  # CI (lint, cobertura, unidade, Selenium) + Delivery
│   └── deploy.yml              # Continuous Deployment na EC2
├── deploy/
│   ├── setup-ec2.sh            # prepara a EC2 (Docker, Nginx, pasta /opt/lumen)
│   └── nginx-lumen.conf        # proxy reverso 80 -> 3000
├── public/                     # página (HTML, CSS, JS)
├── src/
│   ├── app.js                  # rotas Express
│   ├── server.js               # sobe o servidor
│   ├── services/tradutor.js    # regras de tradução
│   └── utils/texto.js          # normalização e validação
├── tests/
│   ├── unit/                   # testes de unidade
│   ├── integration/            # testes das rotas (supertest)
│   └── e2e/                    # teste de interface (Selenium)
├── Dockerfile
├── docker-compose.yaml
├── eslint.config.mjs
└── jest.config.js
```

## Rotas

| Método | Rota | O que faz |
|---|---|---|
| GET | `/` | página do LUMEN |
| GET | `/health` | `{ status, versao }`, usado para conferir o deploy |
| GET | `/api/categorias` | lista as categorias de movimentação |
| POST | `/api/traduzir` | recebe `{ "movimentacao": "..." }` e devolve a tradução |

## Rodando localmente

Pré-requisitos: Node.js 20 ou superior e Google Chrome (para o Selenium).

```bash
npm install
npm run lint        # análise estática (ESLint)
npm test            # testes de unidade + integração com cobertura
npm run test:e2e    # teste de interface com Selenium (abre o Chrome headless)
npm start           # http://localhost:3000
```

O Selenium Manager encontra o driver do Chrome sozinho. Se der erro de versão do ChromeDriver, aponte para um driver específico com a variável `CHROMEDRIVER_PATH`.

---

# Guia de configuração (passo a passo)

Façam na ordem. Reservem uma tarde: a primeira vez costuma levar de 1h a 2h.

## 1. Testar localmente

```bash
npm install
npm run lint
npm test
npm run test:e2e
npm start
```

Abra `http://localhost:3000` e traduza "Conclusos para sentença".

## 2. Repositório novo no GitHub e branches

O enunciado pede um **repositório novo**. Crie no GitHub um repositório público vazio chamado `lumen-devops` (sem README, sem .gitignore). Depois, na pasta do projeto:

```bash
git init
git add .
git commit -m "Estrutura inicial do LUMEN com CI/CD"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/lumen-devops.git
git push -u origin main

git checkout -b develop
git push -u origin develop
```

No GitHub:

- **Settings > General > Default branch**: troque para `develop`. Assim os PRs abrem contra ela.
- **Settings > Collaborators**: adicione os outros dois integrantes do grupo.
- Não ative proteção de branch na `main`: o job de Delivery precisa dar push nela.

O primeiro push na `main` vai disparar o Deploy, que vai falhar porque os secrets e a EC2 ainda não existem. Isso é esperado; ele será rodado de novo no passo 7.

## 3. Docker Hub

Se já tiver feito antes (repositório `projeto-devops` e token), pule para o passo 4.

1. Crie a conta em hub.docker.com.
2. Crie o repositório público **`projeto-devops`**.
3. Em **Account settings > Personal access tokens**, gere um token com permissão **Read & Write** e copie.

## 4. Token do GitHub (para o Delivery)

**Seu perfil > Settings > Developer settings > Personal access tokens > Tokens (classic) > Generate new token (classic)**

- Note: `lumen-devops-delivery`
- Expiration: 30 dias (cobre a apresentação)
- Escopos: **`repo`** e **`workflow`**

Copie o token. Ele só aparece uma vez.

Por que um token pessoal: um push feito com o token padrão do Actions (`GITHUB_TOKEN`) não dispara outros workflows, então o Deploy não rodaria depois do merge automático na `main`.

## 5. Instância EC2

No console da AWS, **EC2 > Launch instance**:

- Nome: `lumen-devops`
- Imagem: **Ubuntu Server 24.04 LTS**
- Tipo: `t2.micro` ou `t3.micro` (free tier)
- Key pair: crie uma nova, tipo RSA, formato **.pem**, e guarde o arquivo
- Security group, regras de entrada:
  - **SSH (22)** com origem **0.0.0.0/0** (Anywhere)
  - **HTTP (80)** com origem **0.0.0.0/0** (Anywhere)

Atenção: se a porta 22 ficar restrita a "My IP", o GitHub Actions não consegue entrar por SSH e o deploy falha com timeout. O acesso continua protegido pela chave `.pem`.

Conecte e prepare a máquina:

```bash
ssh -i lumen-devops.pem ubuntu@IP_PUBLICO
git clone https://github.com/SEU_USUARIO/lumen-devops.git
cd lumen-devops
bash deploy/setup-ec2.sh
exit
```

Entre por SSH de novo e confira com `docker ps` (deve responder sem erro de permissão).

No Windows, se o `ssh` reclamar de permissão do `.pem`, rode no PowerShell:

```powershell
icacls lumen-devops.pem /inheritance:r
icacls lumen-devops.pem /grant:r "$($env:USERNAME):(R)"
```

## 6. Secrets do repositório

**Settings > Secrets and variables > Actions > New repository secret**

| Nome | Valor |
|---|---|
| `ACCESS_TOKEN` | token do GitHub do passo 4 |
| `DOCKER_USERNAME` | seu usuário do Docker Hub |
| `DOCKERHUB_TOKEN` | token do Docker Hub do passo 3 |
| `EC2_HOST` | IP público da EC2 |
| `SSH_PRIVATE_KEY` | conteúdo inteiro do arquivo `.pem`, incluindo as linhas `-----BEGIN` e `-----END` |

## 7. Primeiro deploy

**Actions > Deploy EC2 > Run workflow** (branch `main`). Quando terminar, abra `http://IP_PUBLICO` no navegador. A página do LUMEN deve aparecer com "Versão 1.0" no rodapé.

## 8. Branches de feature

Cada integrante cria pelo menos uma branch de feature e abre um PR para a `develop`. Isso deixa no histórico o uso das branches e a participação do grupo. Exemplo:

```bash
git checkout develop
git pull
git checkout -b feature/nova-movimentacao
# altere o código
git add .
git commit -m "Adiciona tradução de penhora"
git push -u origin feature/nova-movimentacao
```

No GitHub, abra o PR de `feature/nova-movimentacao` para `develop`, espere o CI ficar verde e faça o merge.

---

# Roteiro da apresentação

Ensaiem pelo menos uma vez antes do dia 19/11 com o mesmo roteiro. O pipeline inteiro leva uns 4 a 6 minutos.

**Antes de começar**

- A EC2 precisa estar ligada. Se ela foi parada e religada, o IP público muda: atualize o secret `EC2_HOST` antes de apresentar.
- Deixe abertas as abas: aplicação (`http://IP`), repositório no GitHub e aba Actions.

**1. Aplicação rodando.** Abra `http://IP_DA_EC2`, traduza "Conclusos para sentença" e mostre "Versão 1.0" no rodapé. Opcional: `http://IP_DA_EC2/health`.

**2. Commit na branch de feature.**

```bash
git checkout develop
git pull
git checkout -b feature/versao-1-1
```

Faça uma mudança visível:

- Em `public/index.html`, troque `Versão 1.0` por `Versão 1.1`.
- Em `package.json`, troque `"version": "1.0.0"` por `"version": "1.1.0"` (aparece no `/health`).

```bash
git add .
git commit -m "Atualiza para a versão 1.1"
git push -u origin feature/versao-1-1
```

**3. Pull request para a `develop`.** Abra o PR no GitHub. Mostre o CI rodando no próprio PR com os três jobs: análise estática, testes de unidade com cobertura e Selenium.

**4. Workflows CI e CD.** Faça o merge do PR. Na aba Actions:

- **CI/CD** roda de novo na `develop` e, no final, o job **Delivery** faz o merge na `main`.
- **Deploy EC2** começa sozinho: build da imagem, push no Docker Hub e atualização do container na EC2.

Vale abrir o job de testes e mostrar a tabela de cobertura no log, e o artefato `relatorio-cobertura`.

**5. Aplicação atualizada.** Recarregue `http://IP_DA_EC2` (Ctrl+F5) e mostre "Versão 1.1" no rodapé.

---

## Problemas comuns

| Sintoma | Causa provável |
|---|---|
| Deploy falha com `dial tcp ...:22: i/o timeout` | porta 22 do security group restrita, ou `EC2_HOST` com IP antigo |
| Deploy falha com `ssh: no key found` | `SSH_PRIVATE_KEY` sem as linhas `BEGIN`/`END` ou com espaços extras |
| `permission denied ... docker.sock` na EC2 | faltou sair e entrar de novo no SSH depois do `setup-ec2.sh` |
| Delivery falha com `403` no push | `ACCESS_TOKEN` sem o escopo `repo`/`workflow`, expirado, ou `main` protegida |
| Deploy não dispara depois do Delivery | Delivery usando `GITHUB_TOKEN` em vez do `ACCESS_TOKEN` |
| Página do Nginx "Welcome to nginx" | o `setup-ec2.sh` não rodou até o fim (site default ainda ativo) |
| `502 Bad Gateway` | o container não subiu: na EC2, rode `docker ps` e `docker logs lumen` |
| Coverage falha no CI | cobertura abaixo de 80%: escreva testes para o código novo |

## Boas práticas aplicadas

- **Imagem leve** (Alpine), só dependências de produção e processo sem root.
- **Healthcheck** no container e verificação de `/health` no fim do deploy.
- **Segredos** só nos GitHub Secrets; `.pem` e `.env` no `.gitignore`.
- **Rollback**: cada imagem leva a tag do SHA do commit, então dá para voltar a uma versão anterior.
- **Porta 3000 fechada para fora**: só o Nginx (porta 80) é exposto.
