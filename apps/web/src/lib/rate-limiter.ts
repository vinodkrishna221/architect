// Simple in-memory rate limiter for API endpoints
// Limits requests per IP address within a time window

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 10 * 60 * 1000);

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    resetIn: number; // seconds until reset
}

/**
 * Check if a request is allowed based on IP rate limiting
 * @param ip - The IP address to check
 * @param limit - Maximum requests allowed in the window (default: 3)
 * @param windowMs - Time window in milliseconds (default: 1 hour)
 */
export function checkRateLimit(
    ip: string,
    limit: number = 3,
    windowMs: number = 60 * 60 * 1000 // 1 hour
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitStore.get(ip);

    // If no entry or expired, create new one
    if (!entry || now > entry.resetTime) {
        rateLimitStore.set(ip, {
            count: 1,
            resetTime: now + windowMs,
        });
        return {
            allowed: true,
            remaining: limit - 1,
            resetIn: Math.ceil(windowMs / 1000),
        };
    }

    // Check if within limit
    if (entry.count < limit) {
        entry.count++;
        return {
            allowed: true,
            remaining: limit - entry.count,
            resetIn: Math.ceil((entry.resetTime - now) / 1000),
        };
    }

    // Rate limited
    return {
        allowed: false,
        remaining: 0,
        resetIn: Math.ceil((entry.resetTime - now) / 1000),
    };
}

/**
 * Get IP address from request headers
 * Security: Only trust the leftmost IP (client's original IP) in X-Forwarded-For
 * and validate it's a valid IP format to prevent header injection
 */
export function getClientIP(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
        // Take only the first (leftmost) IP - this is the original client
        const firstIP = forwarded.split(",")[0].trim();
        // Basic validation: check if it looks like an IP
        if (/^[\d.:a-fA-F]+$/.test(firstIP)) {
            return firstIP;
        }
    }
    const realIP = request.headers.get("x-real-ip");
    if (realIP && /^[\d.:a-fA-F]+$/.test(realIP)) {
        return realIP;
    }
    return "unknown";
}
