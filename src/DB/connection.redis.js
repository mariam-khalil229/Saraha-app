import { createClient } from "redis"

const redis_client = createClient({
  url: "rediss://default:gQAAAAAAA64qAAIgcDFjNDJhYTgyYWZiZmE0NWU5OGFjNjNiZGJiN2RjYWJkMw@native-flea-241194.upstash.io:6379"
});

redis_client.on("error", function(err) {
  throw err;
});
await redis_client.connect()
await redis_client.set('foo','bar');

await redis_client.disconnect();