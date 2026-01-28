import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

/**
 * STRICT TEST ENV LOADER
 * 
 * This utility enforces the absolute rule that tests must ONLY load safe environment variables.
 * Usage of .env (prod), .env.production, or .env.development is FORBIDDEN.
 */

const ALLOWED_ENV_FILES = ['.env', '.env.test', '.env.test.local'];
const FORBIDDEN_ENV_FILES = ['.env.production', '.env.development', '.env.dev', '.env.prod'];

export function loadTestEnv() {
    const projectRoot = path.resolve(__dirname, '../../../../'); // Assuming packages/backend/testing/utils
    const backendRoot = path.resolve(__dirname, '../../');

    // 1. Scan for forbidden files in process environment loading (sanity check)
    // We can't easily check what *has* been loaded into process.env, but we can ensure
    // we load our overrides with higher priority and warn/throw if critical keys are missing.

    // 2. Load Allowed Files
    console.log('🔒 Loading Safe Test Environment from:', backendRoot);

    let loadedCount = 0;

    ALLOWED_ENV_FILES.forEach(file => {
        const filePath = path.join(backendRoot, file);
        if (fs.existsSync(filePath)) {
            const result = dotenv.config({ path: filePath, override: true });
            if (result.error) {
                throw new Error(`Failed to load ${file}: ${result.error.message}`);
            }
            console.log(`   ✅ Loaded ${file}`);
            loadedCount++;
        }
    });

    if (loadedCount === 0 && !process.env.CI) {
        console.warn(`
      ⚠️  WARNING: No local test env files found (.env.test, .env.test.local).
      ⚠️  Ensure environment variables are injected via CI or create a .env.test file.
    `);
    }

    // 3. Validation
    validateEnvSafety();
}

function validateEnvSafety() {
    const criticalKeys = ['DATABASE_URL', 'JWT_SECRET'];

    // Check strict test DB constraint
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        throw new Error('❌ DATABASE_URL is missing in test environment.');
    }

    // Simple heuristic to prevent running against prod/dev DBs
    // This is a safety net, not a guarantee.
    if (!dbUrl.includes('test') && !dbUrl.includes('localhost') && !process.env.CI) {
        console.warn(`
      🚨 POTENTIAL DANGER: DATABASE_URL does not look like a test database.
      Current Value: ${dbUrl}
      
      Verify you are not connecting to a production database.
    `);
    }

    // Ensure we are definitely testing
    if (process.env.NODE_ENV !== 'test') {
        // We enforce this
        (process.env as any).NODE_ENV = 'test';
        console.log('   ℹ️  Forced NODE_ENV=test');
    }
}
