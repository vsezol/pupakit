module.exports = {
  verbose: true,
  collectCoverage: true,
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.spec.json'
    }
  },
  coverageDirectory: 'coverage',
  reporters: [['jest-junit', { suiteName: 'Unit Tests', outputDirectory: 'coverage' }]]
};