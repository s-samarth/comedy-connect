import { loadTestEnv } from './utils/env-loader';

// 1. Load Environment Variables SAFELY
// This must run before anything else happens to ensure no prod config leaks.
loadTestEnv();

// 2. Global Setup Logic can go here
// e.g. Timezone setup, global mocks
