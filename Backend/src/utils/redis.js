const Redis = require("ioredis")

let redis = null

if (process.env.REDIS_URL) {
    try {
        redis = new Redis(process.env.REDIS_URL, {
            connectTimeout: 5000,          // 5s timeout to connect
            commandTimeout: 2000,          // 2s timeout for any command (no hanging!)
            maxRetriesPerRequest: 1,       // Don't wait forever if it fails
            retryStrategy: (times) => {
                if (times > 3) return null // Stop retrying after 3 attempts
                return Math.min(times * 100, 2000)
            }
        })

        redis.on("error", (err) => {
            console.error("[Redis] Connection error:", err.message)
            // We don't nullify here anymore; commands will just timeout 
            // if we can't connect, handled by commandTimeout.
        })

        redis.on("connect", () => {
            console.log("[Redis] Connected successfully.")
        })
    } catch (err) {
        console.error("[Redis] Initialization error:", err.message)
    }
} else {
    console.warn("[Redis] REDIS_URL not found. Caching disabled.")
}

/**
 * @description Get value from Redis with safety
 */
async function getCache(key) {
    if (!redis) return null
    try {
        const data = await redis.get(key)
        return data ? JSON.parse(data) : null
    } catch (err) {
        console.error(`[Redis] getCache error for key ${key}:`, err.message)
        return null
    }
}

/**
 * @description Set value in Redis with safety
 */
async function setCache(key, value, ttl = 86400) {
    if (!redis) return
    try {
        const data = JSON.stringify(value)
        // Ensure atomic set with expiry
        await redis.set(key, data, "EX", ttl)
    } catch (err) {
        console.error(`[Redis] setCache error for key ${key}:`, err.message)
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
        console.error(`[Redis] delCache error for key ${key}:`, err.message)
    }
}

module.exports = { getCache, setCache, delCache, redisClient: redis }
