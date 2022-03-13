module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/?(*.)+(spec|test).+(ts|tsx|js)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.+)': '<rootDir>/src/$1',
  },
}
