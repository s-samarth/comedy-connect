import type { Config } from 'jest';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '..',
    roots: ['<rootDir>/testing'],
    testMatch: ['**/*.test.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    setupFilesAfterEnv: ['<rootDir>/testing/config/test-env.ts'],
    testTimeout: 30000,
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    // Run tests sequentially to avoid database conflicts
    maxWorkers: 1,
    // Coverage configuration
    collectCoverageFrom: [
        'app/api/**/*.ts',
        '!app/api/**/*.d.ts',
        '!**/node_modules/**',
    ],
    coverageDirectory: '<rootDir>/testing/coverage',
    coverageReporters: ['text', 'text-summary', 'html'],
};

export default config;
