/**
 * Central export for all MSW handlers
 */

export { showsHandlers } from './shows.handlers';
export { bookingsHandlers } from './bookings.handlers';
export { authHandlers } from './auth.handlers';
export { adminHandlers } from './admin.handlers';

// Combined handlers for use in server setup
import { showsHandlers } from './shows.handlers';
import { bookingsHandlers } from './bookings.handlers';
import { authHandlers } from './auth.handlers';
import { adminHandlers } from './admin.handlers';

export const handlers = [
    ...showsHandlers,
    ...bookingsHandlers,
    ...authHandlers,
    ...adminHandlers,
];
