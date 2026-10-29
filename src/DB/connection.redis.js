import { createClient } from "redis";

export const redis_client = createClient({
   url: process.env.REDIS_URL
});

redis_client.on("error", function(err) {
  console.error("Redis error:", err);
});

const ConnectionRedis = async () => {
    try {
        await redis_client.connect();
        console.log("Redis connected successfully");
    } catch (error) {
        console.error("Failed to connect to Redis:", error);
    }
};

export default ConnectionRedis;