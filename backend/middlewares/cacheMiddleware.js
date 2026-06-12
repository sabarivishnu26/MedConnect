import { getRedisClient, isRedisReady } from "../config/redis.js";
import logger from "../config/logger.js";

/**
 * Cache-aside middleware for GET responses.
 * - HIT: returns cached JSON, sets X-Cache: HIT
 * - MISS: runs controller, caches successful 2xx responses, sets X-Cache: MISS
 * - BYPASS: Redis unavailable, passes through unchanged
 */
export const cacheResponse = ({ keyGenerator, ttlSeconds = 300 }) => {
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    if (!isRedisReady()) {
      res.set("X-Cache", "BYPASS");
      return next();
    }

    const cacheKey = typeof keyGenerator === "function" ? keyGenerator(req) : keyGenerator;
    if (!cacheKey) {
      res.set("X-Cache", "BYPASS");
      return next();
    }

    const redis = getRedisClient();

    try {
      const cached = await redis.get(cacheKey);

      if (cached !== null) {
        logger.info("Cache hit", { event: "cache.hit", key: cacheKey });
        res.set("X-Cache", "HIT");
        return res.status(200).json(JSON.parse(cached));
      }

      logger.info("Cache miss", { event: "cache.miss", key: cacheKey });
      res.set("X-Cache", "MISS");

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis
            .setEx(cacheKey, ttlSeconds, JSON.stringify(body))
            .catch((err) => {
              logger.warn("Cache write failed", { key: cacheKey, error: err.message });
            });
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      logger.warn("Cache middleware error", { key: cacheKey, error: err.message });
      res.set("X-Cache", "BYPASS");
      next();
    }
  };
};
