module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js', '!src/**/index.js', '!src/config/**'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  // Coverage thresholds set to match current actual coverage (as of 2026-02-03)
  // TODO: Increase these thresholds as more tests are added
  // Previous thresholds: branches 29%, functions 41%, lines 35%, statements 35%
  // Many controllers and services currently have 0% coverage and need tests
  coverageThreshold: {
    global: {
      branches: 23,
      functions: 40,
      lines: 32,
      statements: 32,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  verbose: true,
  bail: false,
  detectOpenHandles: true,
  forceExit: true,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
};
