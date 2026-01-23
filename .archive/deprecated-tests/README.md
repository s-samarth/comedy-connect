# Deprecated Tests

> **WARNING**: These test scripts are deprecated and should NOT be used.

The testing system was fully revamped in January 2026. These shell scripts have been replaced by a comprehensive Jest-based testing framework.

## Why These Were Replaced

1. **Runtime Coupling**: Required running development server
2. **Non-Deterministic**: Loose HTTP status checks
3. **No Coverage**: No way to measure test coverage
4. **Manual Steps**: Many tests required manual verification
5. **No Database Isolation**: Used production database
6. **Not CI-Ready**: Could not run in automated pipelines

## New Testing System

Use the new testing system instead:

```bash
npm run test:all
```

See `/testing/README.md` for documentation.

## Archived Files

- `test-auth.sh`
- `test-comedian-management.sh`
- `test-cp4-cp8-verification.sh`
- `test-final-verification.sh`
- `test-image-upload.sh`
- `test-media-handling.sh`
- `test-organizer-verification.sh`
- `test-show-management.sh`
