describe('Backend Infrastructure Smoke Test', () => {
    it('should have correct test environment', () => {
        expect(process.env.NODE_ENV).toBe('test');
    });

    it('should load safe env vars', () => {
        // We expect DATABASE_URL to be present (loaded by strict loader)
        expect(process.env.DATABASE_URL).toBeDefined();
    });
});
