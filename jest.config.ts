import nextJest from 'next/jest';

const createJestConfig = nextJest({ dir: './' });

const config = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup-tests.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^.+\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  collectCoverageFrom: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'modules/**/*.{ts,tsx}', 'hooks/**/*.{ts,tsx}'],
  coverageDirectory: 'coverage'
};

export default createJestConfig(config);

