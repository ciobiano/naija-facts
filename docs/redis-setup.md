# Redis Setup Guide for Naija Facts

## 🎯 Learning Objectives
- Understand Redis caching patterns
- Implement performance optimizations
- Handle real-world scaling scenarios
- Monitor and debug cache behavior

## 📋 Prerequisites

### 1. Install Redis Package
```bash
pnpm install @upstash/redis
```

### 2. Environment Variables Setup

Add these to your `.env.local` file:

```bash
# Upstash Redis (Recommended for production)
UPSTASH_REDIS_REST_URL="https://your-redis-url.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"

# Alternative: Local Redis (for development)
REDIS_URL="redis://localhost:6379"
```

## 🚀 Getting Upstash Redis (Free Tier)

### Step 1: Create Account
1. Go to [console.upstash.com](https://console.upstash.com/)
2. Sign up with GitHub/Google
3. Create a new Redis database

### Step 2: Get Credentials
1. Click on your database
2. Copy the REST URL and Token
3. Add them to your `.env.local`

### Step 3: Verify Connection
```bash
curl -X GET \
  -H "Authorization: Bearer YOUR_TOKEN" \
  "YOUR_REST_URL/set/test/hello"
```

## 🏗️ Architecture Overview

### Current Performance Bottlenecks
```
User Request → Next.js → Database → Response
    ↑               ↑
  100ms        200-500ms
```

### With Redis Caching
```
User Request → Next.js → Redis → Response (Cache Hit)
    ↑               ↑        ↑
  100ms         5-10ms    1-2ms

OR

User Request → Next.js → Redis Miss → Database → Cache & Response
    ↑               ↑         ↑           ↑
  100ms         5ms       50ms      200-500ms
```

## 🎯 Real-World Scenarios

### Scenario 1: Image Gallery Performance
**Before Redis:**
- User scrolls gallery: 20 images × 50ms DB query = 1000ms
- Peak traffic: 100 users = 100,000ms total load

**After Redis:**
- First user: 20 images × 50ms = 1000ms (cache miss)
- Next 99 users: 20 images × 1ms = 20ms each
- 99% performance improvement!

### Scenario 2: Download Tracking
**Before Redis:**
- Every download = immediate DB write
- 1000 downloads = 1000 DB operations
- Risk of deadlocks and performance degradation

**After Redis:**
- Downloads increment Redis counter
- Batch process every minute
- 1000 Redis ops + 1 DB write per minute

### Scenario 3: Search Results
**Before Redis:**
- Same search query hits DB every time
- Complex filters = expensive queries
- Popular searches slow down entire system

**After Redis:**
- Search results cached for 5 minutes
- Popular queries served instantly
- Database load reduced by 80%+

## 🔧 Implementation Patterns

### 1. Cache-Aside Pattern (Most Common)
```typescript
async function getImageMetadata(id: string) {
  // Try cache first
  let data = await cache.get(`image:${id}`);
  
  if (!data) {
    // Cache miss - get from database
    data = await db.image.findUnique({ where: { id } });
    
    // Store in cache for next time
    await cache.set(`image:${id}`, data, { ttl: 3600 });
  }
  
  return data;
}
```

### 2. Write-Through Pattern (For Critical Data)
```typescript
async function updateImageMetadata(id: string, updates: any) {
  // Update database first
  const updated = await db.image.update({ where: { id }, data: updates });
  
  // Update cache immediately
  await cache.set(`image:${id}`, updated, { ttl: 3600 });
  
  return updated;
}
```

### 3. Write-Behind Pattern (For High Volume)
```typescript
async function trackImageView(id: string) {
  // Increment in Redis immediately
  await cache.incr(`views:${id}`);
  
  // Batch update to database later (background job)
  await queue.add('updateViewCounts', { imageId: id });
}
```

## 📊 Performance Monitoring

### Key Metrics to Track
1. **Cache Hit Ratio**: Should be > 80%
2. **Response Time**: Cached responses < 10ms
3. **Memory Usage**: Monitor Redis memory consumption
4. **Error Rate**: Cache failures should fall back gracefully

### Debug Commands
```typescript
// Check cache status
await redis.info();

// Monitor key patterns
await redis.keys('image:*');

// Check TTL for keys
await redis.ttl('image:123');

// Get cache statistics
await redis.info('stats');
```

## 🛡️ Production Considerations

### 1. Error Handling
- Always have fallback to database
- Log cache failures for monitoring
- Implement circuit breaker pattern

### 2. Memory Management
- Set appropriate TTL values
- Monitor memory usage
- Use Redis maxmemory policies

### 3. Security
- Use environment variables for credentials
- Enable Redis AUTH if self-hosting
- Network security (VPC, firewalls)

### 4. Scaling
- Start with single Redis instance
- Consider Redis Cluster for high volume
- Monitor connection pool usage

## 🎓 Learning Exercises

### Exercise 1: Implement Basic Caching
1. Cache image metadata in download route
2. Measure response time difference
3. Check cache hit/miss logs

### Exercise 2: Batch Processing
1. Implement view count batching
2. Create background job for DB updates
3. Monitor Redis memory usage

### Exercise 3: Search Result Caching
1. Cache image search results
2. Implement cache invalidation
3. Test with different search patterns

## 📚 Additional Resources
- [Upstash Redis Documentation](https://docs.upstash.com/redis)
- [Redis Caching Patterns](https://redis.io/docs/manual/patterns/)
- [Next.js Caching Strategies](https://nextjs.org/docs/app/building-your-application/caching)

---

> **Remember**: Start simple, measure everything, and optimize based on real usage patterns! 