module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  verbose: true,
  // Increase default test timeout for DB operations in CI/dev
  testTimeout: 20000,
};
