/**
 * Test utility functions
 */

/**
 * Wait for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a mock file for file upload testing
 */
export function createMockFile(
    name: string = 'test.jpg',
    size: number = 1024,
    type: string = 'image/jpeg'
): File {
    const blob = new Blob([''], { type });
    return new File([blob], name, { type });
}

/**
 * Simulate API delay for more realistic testing
 */
export async function simulateApiDelay(ms: number = 100): Promise<void> {
    await wait(ms);
}

/**
 * Generate a random ID for testing
 */
export function generateTestId(): string {
    return `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format currency for testing comparisons
 */
export function formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Check if element has specific class (helper for styled components)
 */
export function hasClass(element: HTMLElement, className: string): boolean {
    return element.className.split(' ').includes(className);
}
