// Três "projetos" de teste, cada um rodado por um job diferente no CI:
//  - unit:        testes de unidade (funções puras, sem servidor)
//  - integration: testes das rotas HTTP com supertest
//  - e2e:         teste de interface com Selenium (abre o Chrome de verdade)
module.exports = {
  collectCoverageFrom: ['src/**/*.js', '!src/server.js'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov'],
  coverageThreshold: {
    global: { statements: 80, branches: 80, functions: 80, lines: 80 },
  },
  projects: [
    {
      displayName: 'unit',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/unit/**/*.test.js'],
    },
    {
      displayName: 'integration',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
    },
    {
      displayName: 'e2e',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/e2e/**/*.test.js'],
    },
  ],
};
