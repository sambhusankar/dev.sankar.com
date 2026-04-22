# Building Internal Dashboards That Actually Perform

Internal dashboards have a reputation for being slow. Everyone accepts it. Nobody should. Here's what I learned after cutting our main dashboard's load time by 40%.

## The problem

Our dashboard was making 12 separate API calls on page load, each hitting the database with unoptimised queries. Users were waiting 6–8 seconds to see anything useful.

## Step 1: Measure first

Before changing anything, I added timing logs to every API endpoint. Turns out two queries accounted for 70% of the load time. That told me exactly where to focus.

## Step 2: Fix the queries

The slow queries were doing full table scans. Adding the right indexes and rewriting a few joins brought query time from ~2s down to ~80ms each.

```sql
-- Before: no index, full scan
SELECT * FROM orders WHERE user_id = 123;

-- After: index on user_id
CREATE INDEX idx_orders_user ON orders(user_id);
SELECT id, total, created_at FROM orders WHERE user_id = 123;
```

## Step 3: Cache aggressively

Dashboard data doesn't need to be real-time. We added a 60-second server-side cache for the heaviest endpoints. Users see data that's at most a minute old — they never noticed.

## Step 4: Load what's visible

We moved charts below the fold to load lazily. The top summary cards load instantly; charts appear as the user scrolls. Perceived performance improved dramatically even before the other fixes.

## Results

- Page load: 7.2s → 4.3s (40% reduction)
- Database load: down 60% during peak hours
- Zero complaints since the release

The lesson: measure before you optimise, fix the database before the frontend, and cache anything that doesn't need to be live.
