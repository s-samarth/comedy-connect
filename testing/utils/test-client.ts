/**
 * Test HTTP Client
 * 
 * Provides utilities for making HTTP requests to API routes in tests.
 * Uses the Next.js API route handlers directly for unit tests.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Create a mock NextRequest for testing API routes
 * Note: Uses 'any' type to bypass Next.js strict RequestInit typing
 */
export function createMockRequest(
    method: string,
    url: string,
    options: {
        body?: unknown;
        headers?: Record<string, string>;
        searchParams?: Record<string, string>;
    } = {}
): NextRequest {
    const baseUrl = 'http://localhost:3000';
    const urlObj = new URL(url, baseUrl);

    // Add search params
    if (options.searchParams) {
        Object.entries(options.searchParams).forEach(([key, value]) => {
            urlObj.searchParams.set(key, value);
        });
    }

    const headers = new Headers({
        'Content-Type': 'application/json',
        ...options.headers,
    });

    let body: string | undefined;
    if (options.body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        body = JSON.stringify(options.body);
    }

    // Create NextRequest - using 'any' to handle Next.js strict typing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new NextRequest(urlObj, { method, headers, body } as any);
}

/**
 * Parse the JSON response from a NextResponse
 */
export async function parseResponse<T>(response: NextResponse): Promise<{
    status: number;
    data: T;
}> {
    const data = await response.json() as T;
    return {
        status: response.status,
        data,
    };
}

/**
 * Helper to make GET requests
 */
export function mockGET(
    url: string,
    options: { headers?: Record<string, string>; searchParams?: Record<string, string> } = {}
): NextRequest {
    return createMockRequest('GET', url, options);
}

/**
 * Helper to make POST requests
 */
export function mockPOST(
    url: string,
    body?: unknown,
    options: { headers?: Record<string, string> } = {}
): NextRequest {
    return createMockRequest('POST', url, { body, ...options });
}

/**
 * Helper to make PUT requests
 */
export function mockPUT(
    url: string,
    body?: unknown,
    options: { headers?: Record<string, string> } = {}
): NextRequest {
    return createMockRequest('PUT', url, { body, ...options });
}

/**
 * Helper to make DELETE requests
 */
export function mockDELETE(
    url: string,
    options: { headers?: Record<string, string> } = {}
): NextRequest {
    return createMockRequest('DELETE', url, options);
}

/**
 * Assert response status and optionally parse body
 */
export async function expectStatus(
    response: NextResponse,
    expectedStatus: number
): Promise<void> {
    expect(response.status).toBe(expectedStatus);
}

/**
 * Assert response contains error
 */
export async function expectError(
    response: NextResponse,
    expectedStatus: number,
    errorMessageContains?: string
): Promise<void> {
    expect(response.status).toBe(expectedStatus);
    const data = await response.json();
    expect(data).toHaveProperty('error');
    if (errorMessageContains) {
        expect(data.error.toLowerCase()).toContain(errorMessageContains.toLowerCase());
    }
}
