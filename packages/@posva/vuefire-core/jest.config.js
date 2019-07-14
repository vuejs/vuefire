module.exports = {
  preset: 'ts-jest',
  collectCoverage: true,
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  testMatch: ['<rootDir>/__tests__/**/*.spec.ts'],
  testEnvironment: 'node',
  testURL: 'http://localhost/'
}
