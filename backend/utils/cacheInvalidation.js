import { getRedisClient, isRedisReady } from "../config/redis.js";
import logger from "../config/logger.js";
import { cacheKeys, CACHE_PREFIX } from "./cacheKeys.js";

const deleteKeys = async (keys) => {
  if (!isRedisReady()) return;

  const redis = getRedisClient();
  const unique = [...new Set(keys.filter(Boolean))];
  if (unique.length === 0) return;

  try {
    await redis.del(unique);
    logger.info("Cache invalidated", { event: "cache.invalidate", keys: unique });
  } catch (err) {
    logger.warn("Cache invalidation failed", { keys: unique, error: err.message });
  }
};

const deleteByPattern = async (pattern) => {
  if (!isRedisReady()) return;

  const redis = getRedisClient();
  const keysToDelete = [];

  try {
    for await (const key of redis.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      keysToDelete.push(key);
    }

    if (keysToDelete.length > 0) {
      await redis.del(keysToDelete);
      logger.info("Cache invalidated by pattern", {
        event: "cache.invalidate.pattern",
        pattern,
        count: keysToDelete.length,
      });
    }
  } catch (err) {
    logger.warn("Cache pattern invalidation failed", { pattern, error: err.message });
  }
};

export const invalidateDoctorCache = async (doctorId) => {
  const id = doctorId?.toString();

  await deleteKeys([
    cacheKeys.doctorsList(),
    id ? cacheKeys.doctorProfile(id) : null,
  ]);

  if (id) {
    await deleteByPattern(`${CACHE_PREFIX}:appointments:doctor:${id}*`);
  }
};

export const invalidateAppointmentCaches = async ({ userId, doctorId, date }) => {
  const uid = userId?.toString();
  const did = doctorId?.toString();
  const keys = [];

  if (uid) keys.push(cacheKeys.userAppointments(uid));

  if (did) {
    keys.push(cacheKeys.doctorAppointments(did));
    keys.push(cacheKeys.doctorProfile(did));
    keys.push(cacheKeys.doctorsList());

    if (date) {
      keys.push(cacheKeys.doctorAppointmentsByDate(did, date));
    }
  }

  await deleteKeys(keys);

  if (did && !date) {
    await deleteByPattern(`${CACHE_PREFIX}:appointments:doctor:${did}:date:*`);
  }
};

export const invalidatePatientCache = async (userId) => {
  const id = userId?.toString();
  await deleteKeys([id ? cacheKeys.patientProfile(id) : null]);
};
