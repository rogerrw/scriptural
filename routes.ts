/**
 * Publicly accessible routes
 * @type {string[]}
 */
export const publicRoutes = ['/', '/about', '/terms', '/support', '/privacy'];

/**
 * These routes will redirect logged in users to /
 * @type {string[]}
 */
export const authRoutes = ['/auth/signin', '/auth/register'];

/**
 * Routes that start with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = '/api/auth';

export const DEFAULT_LOGIN_REDIRECT = '/dashboard';
