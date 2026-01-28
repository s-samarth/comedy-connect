import type { Config } from 'jest';
import path from 'path';

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: '..',         // packages/backend/testing -> packages/backend
    roots: ['<rootDir>/testing'],
    testMatch: ['**/*.test.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
    // Load strict env vars BEFORE everything
    setupFiles: ['<rootDir>/testing/setup.ts'],
    globalTeardown: '<rootDir>/testing/teardown.ts',
    testTimeout: 30000,
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
    maxWorkers: 1, // Sequential for DB safety
};

export default config;
