export default {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/', '/coverage/'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/config/**',
    '!src/swagger.js',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testTimeout: 10000,
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: false,
  coverageReporters: ['text', 'lcov', 'html'],
  watchPathIgnorePatterns: ['/node_modules/', '/coverage/'],
  testPathIgnorePatterns: ['/node_modules/'],
};