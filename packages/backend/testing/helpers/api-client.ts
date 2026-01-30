import request, { Response } from 'supertest';
import type { Application } from 'express';

/**
 * API Client wrapper around Supertest for cleaner test syntax
 */

export class ApiClient {
    private app: Application;
    private authToken?: string;

    constructor(app: Application) {
        this.app = app;
    }

    /**
     * Set authentication token for subsequent requests
     */
    authenticate(token: string): this {
        this.authToken = token;
        return this;
    }

    /**
     * Make a GET request
     */
    async get(path: string, query?: Record<string, any>): Promise<Response> {
        let req = request(this.app).get(path);

        if (this.authToken) {
            req = req.set('Authorization', `Bearer ${this.authToken}`);
        }

        if (query) {
            req = req.query(query);
        }

        return req;
    }

    /**
     * Make a POST request
     */
    async post(path: string, body?: any): Promise<Response> {
        let req = request(this.app).post(path);

        if (this.authToken) {
            req = req.set('Authorization', `Bearer ${this.authToken}`);
        }

        if (body) {
            req = req.send(body);
        }

        return req;
    }

    /**
     * Make a PATCH request
     */
    async patch(path: string, body?: any): Promise<Response> {
        let req = request(this.app).patch(path);

        if (this.authToken) {
            req = req.set('Authorization', `Bearer ${this.authToken}`);
        }

        if (body) {
            req = req.send(body);
        }

        return req;
    }

    /**
     * Make a DELETE request
     */
    async delete(path: string): Promise<Response> {
        let req = request(this.app).delete(path);

        if (this.authToken) {
            req = req.set('Authorization', `Bearer ${this.authToken}`);
        }

        return req;
    }

    /**
     * Clear authentication token
     */
    clearAuth(): this {
        this.authToken = undefined;
        return this;
    }
}

/**
 * Create a new API client instance
 */
export function createApiClient(app: Application): ApiClient {
    return new ApiClient(app);
}
