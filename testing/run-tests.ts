#!/usr/bin/env ts-node
/**
 * Comedy Connect Test Runner
 * 
 * Unified test execution script that runs all test suites
 * and provides a clear pass/fail summary.
 * 
 * Usage: npm run test:all
 */

import { execSync, ExecSyncOptions } from 'child_process';
import * as path from 'path';

interface TestResult {
    name: string;
    passed: boolean;
    testCount?: number;
    duration?: number;
    error?: string;
}

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
};

function log(message: string, color: string = colors.reset): void {
    console.log(`${color}${message}${colors.reset}`);
}

function runTestSuite(name: string, pattern: string): TestResult {
    const startTime = Date.now();

    try {
        const options: ExecSyncOptions = {
            cwd: path.join(__dirname, '..'),
            encoding: 'utf-8',
            stdio: 'pipe',
            env: {
                ...process.env,
                NODE_ENV: 'test',
            },
        };

        const output = execSync(
            `npx jest --config testing/jest.config.ts --testPathPattern='${pattern}' --passWithNoTests`,
            options
        ) as string;

        // Parse test count from output
        const testMatch = output.match(/Tests:\s+(\d+)\s+passed/);
        const testCount = testMatch ? parseInt(testMatch[1], 10) : undefined;

        return {
            name,
            passed: true,
            testCount,
            duration: Date.now() - startTime,
        };
    } catch (error: any) {
        return {
            name,
            passed: false,
            duration: Date.now() - startTime,
            error: error.stdout || error.message,
        };
    }
}

async function main(): Promise<void> {
    log('\n🧪 Comedy Connect Test Suite\n', colors.bold + colors.cyan);
    log('═'.repeat(50), colors.cyan);

    const testSuites = [
        { name: 'Schema Tests', pattern: 'schema' },
        { name: 'API Unit Tests', pattern: 'unit/api' },
        { name: 'Integration Tests', pattern: 'integration' },
        { name: 'Security Tests', pattern: 'security' },
    ];

    const results: TestResult[] = [];
    let totalTests = 0;
    let totalDuration = 0;

    for (const suite of testSuites) {
        process.stdout.write(`Running ${suite.name}... `);
        const result = runTestSuite(suite.name, suite.pattern);
        results.push(result);

        if (result.passed) {
            log(`✔ PASS${result.testCount ? ` (${result.testCount} tests)` : ''}`, colors.green);
            totalTests += result.testCount || 0;
        } else {
            log(`✖ FAIL`, colors.red);
        }
        totalDuration += result.duration || 0;
    }

    // Print summary
    log('\n' + '═'.repeat(50), colors.cyan);
    log('\n📊 Test Summary\n', colors.bold);

    const passedSuites = results.filter(r => r.passed).length;
    const failedSuites = results.filter(r => !r.passed);

    for (const result of results) {
        const icon = result.passed ? '✔' : '✖';
        const color = result.passed ? colors.green : colors.red;
        const duration = result.duration ? ` (${(result.duration / 1000).toFixed(1)}s)` : '';
        log(`${icon} ${result.name.padEnd(20)} ${result.passed ? 'PASS' : 'FAIL'}${duration}`, color);
    }

    log('\n' + '─'.repeat(50));
    log(`Total: ${results.length} suites | Passed: ${passedSuites} | Failed: ${failedSuites.length}`);
    log(`Time: ${(totalDuration / 1000).toFixed(1)}s`);

    // Print failures
    if (failedSuites.length > 0) {
        log('\n❌ Failed Tests:\n', colors.red + colors.bold);
        for (const failed of failedSuites) {
            log(`  ↳ ${failed.name}`, colors.red);
            if (failed.error) {
                // Extract relevant error info
                const errorLines = failed.error.split('\n').slice(0, 10);
                for (const line of errorLines) {
                    if (line.includes('FAIL') || line.includes('●') || line.includes('expect')) {
                        log(`    ${line}`, colors.yellow);
                    }
                }
            }
        }
    }

    // Final result
    log('\n' + '═'.repeat(50), colors.cyan);
    if (failedSuites.length === 0) {
        log('\n✅ OVERALL RESULT: PASS\n', colors.green + colors.bold);
        process.exit(0);
    } else {
        log('\n❌ OVERALL RESULT: FAIL\n', colors.red + colors.bold);
        process.exit(1);
    }
}

main().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
});
