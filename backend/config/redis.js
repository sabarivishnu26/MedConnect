import { createClient } from "redis";
import logger from "./logger.js";

let client = null;

export const connectRedis = async () => {
  if (process.env.REDIS_ENABLED === "false") {
    logger.warn("Redis caching disabled via REDIS_ENABLED=false");
    return null;
  }

  const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";

  try {
    client = createClient({
      url,
      socket: {
        connectTimeout: 5_000,
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            logger.error("Redis max reconnection attempts reached");
            return false;
          }
          return Math.min(retries * 100, 3_000);
        },
      },
    });

    client.on("error", (err) => {
      logger.error("Redis client error", { error: err.message });
    });

    client.on("reconnecting", () => {
      logger.warn("Redis reconnecting");
    });

    client.on("ready", () => {
      logger.info("Redis connected and ready");
    });

    await client.connect();
    return client;
  } catch (err) {
    logger.warn("Redis connection failed; running without cache", { error: err.message });
    client = null;
    return null;
  }
};

export const getRedisClient = () => client;

export const isRedisReady = () => Boolean(client?.isReady);

export const disconnectRedis = async () => {
  if (client?.isOpen) {
    await client.quit();
    client = null;
  }
};
