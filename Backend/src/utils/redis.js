const Redis = require("ioredis")

let redis = null

if (process.env.REDIS_URL) {
    try {
        redis = new Redis(process.env.REDIS_URL, {
            maxRetriesPerRequest: 3,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000)
                return delay
            }
        })

        redis.on("error", (err) => {
            console.error("[Redis] Error connecting:", err.message)
            redis = null // Fallback to no-cache
        })

        redis.on("connect", () => {
            console.log("[Redis] Connected successfully.")
        })
    } catch (err) {
        console.error("[Redis] Initialization failed:", err.message)
    }
} else {
    console.warn("[Redis] REDIS_URL not found. Caching is disabled.")
}

/**
 * @description Get value from Redis
 */
async function getCache(key) {
    if (!redis) return null
    try {
        const data = await redis.get(key)
        return data ? JSON.parse(data) : null
    } catch (err) {
        return null
    }
}

/**
 * @description Set value in Redis with TTL (default 24h)
 */
async function setCache(key, value, ttl = 86400) {
    if (!redis) return
    try {
        const data = JSON.stringify(value)
        await redis.set(key, data, "EX", ttl)
    } catch (err) {
        // Silently fail, caching is secondary
    }
}

/**
 * @description Delete key from Redis
 */
async function delCache(key) {
    if (!redis) return
    try {
        await redis.del(key)
    } catch (err) {
        // Silently fail
    }
}

module.exports = { getCache, setCache, delCache, redisClient: redis }
