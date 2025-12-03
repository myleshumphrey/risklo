# RiskLo Scalability Guide: Handling 1000+ Concurrent Users

## Current Architecture Overview
- **Frontend**: React app on Netlify (CDN)
- **Backend**: Node.js/Express on Railway
- **Data Source**: Google Sheets API (no caching currently)
- **Auth**: Google OAuth
- **Payments**: Stripe

---

## 🚨 Critical Bottlenecks & Solutions

### 1. **Google Sheets API Rate Limits** ⚠️ **HIGHEST PRIORITY**

**Current Problem:**
- Every analysis request calls Google Sheets API directly
- Google Sheets API limits:
  - **60 requests per minute per project** (service account)
  - **100 requests per 100 seconds per user** (OAuth)
- With 1000 users, you'll hit limits immediately

**Solutions:**

#### Option A: Implement Caching Layer (Recommended)
```javascript
// Add Redis or in-memory cache
const NodeCache = require('node-cache');
const sheetCache = new NodeCache({ stdTTL: 300 }); // 5 min cache

async function getSheetData(sheetName) {
  const cacheKey = `sheet_${sheetName}`;
  const cached = sheetCache.get(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const data = await fetchFromGoogleSheets(sheetName);
  sheetCache.set(cacheKey, data);
  return data;
}
```

**Cache Strategy:**
- Cache sheet names: 5-10 minutes
- Cache sheet data: 5-15 minutes (strategy data doesn't change frequently)
- Invalidate cache when Google Sheet is updated (webhook or manual refresh)

#### Option B: Move to Database (Best Long-term)
- Export Google Sheets data to PostgreSQL/MongoDB
- Update database via scheduled job (every 15-30 min)
- Serve all requests from database
- **Benefits**: No rate limits, faster queries, better scalability

---

### 2. **Backend Server Scaling**

**Current State:**
- Single Railway instance
- No load balancing
- No horizontal scaling

**Solutions:**

#### Railway Auto-Scaling
```toml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 100
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10

# Enable auto-scaling
[deploy.scaling]
minInstances = 1
maxInstances = 5
targetCPU = 70
targetMemory = 80
```

**Considerations:**
- Railway Pro plan for better scaling
- Monitor CPU/Memory usage
- Set up alerts for high usage

#### Alternative: Use Load Balancer
- Deploy multiple backend instances
- Use Railway's load balancer or Cloudflare
- Distribute traffic across instances

---

### 3. **Rate Limiting** ⚠️ **CRITICAL**

**Current Problem:**
- No rate limiting on API endpoints
- Users can spam requests
- Risk of DDoS or abuse

**Solution: Implement Rate Limiting**

```javascript
const rateLimit = require('express-rate-limit');

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for analysis endpoint
const analysisLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 analyses per minute
  message: 'Too many analysis requests. Please wait a moment.',
});

app.use('/api/', apiLimiter);
app.use('/api/analyze', analysisLimiter);
```

**Install:**
```bash
npm install express-rate-limit
```

---

### 4. **Database for User Data**

**Current Problem:**
- No user data persistence
- Disclaimer acceptance stored in localStorage only
- No analytics or user tracking

**Solutions:**

#### Option A: PostgreSQL (Recommended)
- Store user preferences
- Track usage analytics
- Store calculation history (optional)
- Use Railway PostgreSQL addon

#### Option B: MongoDB
- More flexible schema
- Good for rapid development
- Use MongoDB Atlas (free tier available)

**What to Store:**
- User preferences
- Calculation history (optional, for "Recent Calculations")
- Usage analytics
- Disclaimer acceptance

---

### 5. **Frontend Optimization**

**Current State:**
- Single bundle (may be large)
- No code splitting
- All components load upfront

**Solutions:**

#### Code Splitting
```javascript
// Lazy load heavy components
const BulkRiskCalculator = React.lazy(() => import('./components/BulkRiskCalculator'));
const CsvUpload = React.lazy(() => import('./components/CsvUpload'));

// Use Suspense
<Suspense fallback={<Loading />}>
  <BulkRiskCalculator />
</Suspense>
```

#### Bundle Optimization
- Analyze bundle size: `npm run build -- --analyze`
- Remove unused dependencies
- Use dynamic imports for large libraries

#### CDN & Caching
- Netlify handles CDN automatically
- Set proper cache headers
- Use service workers for offline support

---

### 6. **Monitoring & Observability**

**Current Problem:**
- No monitoring
- No error tracking
- No performance metrics

**Solutions:**

#### Add Monitoring
```javascript
// Use Sentry for error tracking
const Sentry = require('@sentry/node');
Sentry.init({ dsn: process.env.SENTRY_DSN });

// Use PM2 or Railway metrics
// Track:
// - Request latency
// - Error rates
// - API quota usage
// - Memory/CPU usage
```

#### Logging
```javascript
// Use Winston or Pino for structured logging
const logger = require('winston');

logger.info('Analysis request', {
  sheetName,
  accountSize,
  timestamp: new Date().toISOString()
});
```

---

### 7. **Cost Considerations**

**Current Costs:**
- Netlify: Free tier (100GB bandwidth/month)
- Railway: $5-20/month (depends on usage)
- Google Sheets API: Free (but rate limited)
- Stripe: 2.9% + $0.30 per transaction

**At 1000+ Users:**
- **Netlify**: May need Pro ($19/month) for more bandwidth
- **Railway**: $20-100/month (scaling instances)
- **Database**: $0-25/month (PostgreSQL addon)
- **Redis Cache**: $0-10/month (optional, Railway addon)
- **Monitoring**: $0-25/month (Sentry free tier available)

**Total Estimated**: $50-200/month

---

## 📋 Implementation Priority

### Phase 1: Critical (Do First) 🔴
1. **Implement caching** for Google Sheets API
   - Use NodeCache or Redis
   - Cache sheet names and data
   - Set TTL to 5-15 minutes

2. **Add rate limiting**
   - Install `express-rate-limit`
   - Set limits on `/api/analyze` endpoint
   - Prevent abuse

3. **Add health check endpoint**
   - Monitor server status
   - Set up uptime monitoring

### Phase 2: Important (Do Soon) 🟡
4. **Move to database**
   - Export Google Sheets to PostgreSQL
   - Scheduled sync job
   - Serve from database

5. **Add monitoring**
   - Error tracking (Sentry)
   - Performance monitoring
   - Logging

6. **Optimize frontend**
   - Code splitting
   - Bundle optimization
   - Lazy loading

### Phase 3: Nice to Have (Do Later) 🟢
7. **Horizontal scaling**
   - Multiple backend instances
   - Load balancer

8. **Advanced caching**
   - Redis for distributed cache
   - Cache invalidation strategy

9. **User analytics**
   - Track usage patterns
   - Identify bottlenecks

---

## 🛠️ Quick Wins (Can Implement Today)

### 1. Add Basic Caching (30 minutes)
```bash
npm install node-cache
```

```javascript
// server/index.js
const NodeCache = require('node-cache');
const sheetCache = new NodeCache({ stdTTL: 300 }); // 5 min

async function getSheetData(sheetName) {
  const cacheKey = `sheet_${sheetName}`;
  const cached = sheetCache.get(cacheKey);
  if (cached) return cached;
  
  const data = await fetchFromGoogleSheets(sheetName);
  sheetCache.set(cacheKey, data);
  return data;
}
```

### 2. Add Rate Limiting (15 minutes)
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
});

app.use('/api/analyze', limiter);
```

### 3. Add Health Check (5 minutes)
```javascript
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

---

## 📊 Expected Performance

### Current (No Optimization)
- **Concurrent Users**: ~10-20 before issues
- **Google Sheets API**: Hits rate limit quickly
- **Response Time**: 1-3 seconds (API calls)

### After Phase 1 (Caching + Rate Limiting)
- **Concurrent Users**: 100-200
- **Google Sheets API**: Much fewer calls (cached)
- **Response Time**: 100-500ms (cached), 1-3s (cache miss)

### After Phase 2 (Database)
- **Concurrent Users**: 1000+
- **Database**: Fast queries (<100ms)
- **Response Time**: 50-200ms average

---

## 🔍 Testing Scalability

### Load Testing Tools
```bash
# Install Apache Bench
brew install httpd  # macOS
apt-get install apache2-utils  # Linux

# Test endpoint
ab -n 1000 -c 10 https://your-api.railway.app/api/health

# Or use k6 (better)
npm install -g k6
```

### Monitor These Metrics
- **Response Time**: p50, p95, p99
- **Error Rate**: Should be < 1%
- **Throughput**: Requests per second
- **Memory Usage**: Should stay stable
- **CPU Usage**: Should stay < 80%

---

## 🚀 Recommended Architecture (Future)

```
┌─────────────┐
│   Netlify   │  (CDN, Static Assets)
│  (Frontend) │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Cloudflare     │  (DDoS Protection, Rate Limiting)
│  (Optional)     │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   Railway       │  (Load Balancer)
│  (Backend)      │
└──────┬──────────┘
       │
       ├──► Instance 1 (Node.js)
       ├──► Instance 2 (Node.js)
       └──► Instance 3 (Node.js)
       │
       ▼
┌─────────────────┐
│   PostgreSQL    │  (Strategy Data)
│   (Database)    │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│     Redis       │  (Cache Layer)
│   (Optional)    │
└─────────────────┘
```

---

## 📝 Action Items Checklist

- [ ] Install `node-cache` and implement caching
- [ ] Install `express-rate-limit` and add rate limiting
- [ ] Set up Railway auto-scaling
- [ ] Add health check endpoint
- [ ] Set up error monitoring (Sentry)
- [ ] Add logging
- [ ] Plan database migration
- [ ] Set up load testing
- [ ] Monitor costs
- [ ] Create runbook for incidents

---

## 💡 Key Takeaways

1. **Google Sheets API is your biggest bottleneck** - Cache or move to database
2. **Rate limiting is essential** - Prevent abuse and DDoS
3. **Monitoring is critical** - Know before users complain
4. **Start simple** - NodeCache + Rate Limiting = 80% of the benefit
5. **Plan for growth** - Database migration should be on roadmap

---

## 📚 Resources

- [Railway Scaling Docs](https://docs.railway.app/guides/scaling)
- [Google Sheets API Quotas](https://developers.google.com/sheets/api/limits)
- [Express Rate Limiting](https://github.com/express-rate-limit/express-rate-limit)
- [Node Cache](https://github.com/node-cache/node-cache)
- [Sentry Error Tracking](https://sentry.io/)

---

**Questions?** Review this guide and prioritize based on your current traffic patterns and budget.

