import {redis_client} from '../DB/connection.redis.js'

export const setValue = async ({key, value, ttl} = {}) => {
    try {
        value = typeof value === 'string' ? JSON.stringify(value) : value;
        ttl?
             await redis_client.set(key, value, { EX: ttl }):
             await redis_client.expire(key, value);
    } catch (error) {
        console.error("Error setting key-value in Redis:", error);
    }
}
 
export const updateValue = async ({key, value, ttl} = {}) => {
    try {
        if (!await redis_client.exists(key)) {
            return 0;
        }
             await redis_client.set(key, value, { EX: ttl })
    } catch (error) {
        console.error("Error setting key-value in Redis:", error);
    }
}

export const getValue = async (key) => {
 try {   
    try {
        return JSON.parse(await redis_client.get(key));
    } catch (error) {
        return await redis_client.get(key);
    }
} catch (error) {
    console.error("Error getting value from Redis:", error);
}
}

export const ttl = async (key) => {
    try {
        return await redis_client.ttl(key);
    } catch (error) {
        console.error("Error getting TTL from Redis:", error);
    }
}

export const exists = async (key) => {
    try {
        return await redis_client.exists(key,ttl);
    } catch (error) {
        console.error("Error checking if key exists in Redis:", error);
    }
}

export const deleteKeys = async (key) => {
    try {
        if (!key?.length) {return 0}
        return await redis_client.del(key);
    } catch (error) {
        console.error("Error deleting key from Redis:", error);
    }
}

export const keys = async (key) => {
    try {
        return await redis_client.keys(`${key}*`);
    } catch (error) {
        console.error("Error checking if key exists in Redis:", error);
    }
}

export const incr = async (key) => {
    try {
        return await redis_client.incr(key);
    } catch (error) {
        console.error("Error incrementing key in Redis:", error);
    }
}



