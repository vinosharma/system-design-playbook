# System Design Estimation Cheat Sheet

> **Print this.** Keep it handy during interviews and design sessions.

---

## Powers of 2

| Power | Exact Value | Approximation | Name |
|-------|-------------|---------------|------|
| 2^10 | 1,024 | ~1 Thousand | 1 KB |
| 2^20 | 1,048,576 | ~1 Million | 1 MB |
| 2^30 | 1,073,741,824 | ~1 Billion | 1 GB |
| 2^40 | 1,099,511,627,776 | ~1 Trillion | 1 TB |

---

## Latency Numbers (2026)

| Operation | Latency | Relative |
|-----------|---------|----------|
| L1 cache reference | 0.5 ns | 1x |
| L2 cache reference | 7 ns | 14x |
| RAM access | 100 ns | 200x |
| SSD random read | 150 µs | 300,000x |
| Round trip (same datacenter) | 500 µs | 1,000,000x |
| Disk seek | 10 ms | 20,000,000x |
| Round trip CA ↔ Netherlands | 150 ms | 300,000,000x |

**Key insight:** Cross-region is **300x slower** than same datacenter.

---

## Time Conversions

| Period | Seconds | Approximation |
|--------|---------|---------------|
| 1 minute | 60 | 60 |
| 1 hour | 3,600 | 4K |
| 1 day | 86,400 | 100K |
| 1 week | 604,800 | 600K |
| 1 month | 2,592,000 | 2.5M |
| 1 year | 31,536,000 | 32M |

---

## Storage Sizes

| Unit | Bytes | Approximation |
|------|-------|---------------|
| 1 KB | 1,024 | ~1,000 |
| 1 MB | 1,048,576 | ~1 Million |
| 1 GB | 1,073,741,824 | ~1 Billion |
| 1 TB | 1,099,511,627,776 | ~1 Trillion |

### Common Data Sizes

| Item | Size |
|------|------|
| ASCII character | 1 Byte |
| Unicode character | 2-4 Bytes |
| Integer (32-bit) | 4 Bytes |
| Timestamp (64-bit) | 8 Bytes |
| UUID | 16 Bytes |
| Tweet (280 chars + metadata) | 500 Bytes |
| Database row | 1 KB |
| Small image | 50 KB |
| Profile picture | 200 KB |
| High-res photo | 5 MB |
| HD video (1 hour) | 3 GB |
| 4K video (1 hour) | 15 GB |

---

## Network Bandwidth

| Speed | Bytes/Second | Transfer 1 GB |
|-------|--------------|---------------|
| 1 Mbps | 125 KB/s | ~2 hours |
| 10 Mbps | 1.25 MB/s | ~13 min |
| 100 Mbps | 12.5 MB/s | ~80 sec |
| 1 Gbps | 125 MB/s | 8 sec |
| 10 Gbps | 1.25 GB/s | 0.8 sec |

**Conversion:** Divide by 8 to convert bits to bytes.

---

## Server Capacity (QPS)

| Server Type | QPS Capacity |
|-------------|--------------|
| Web server | 1,000 - 10,000 |
| App server | 500 - 5,000 |
| Database (read-heavy) | 1,000 - 5,000 |
| Database (write-heavy) | 100 - 1,000 |
| Cache (Redis) | 100,000 - 500,000 |
| Message queue (Kafka) | 50,000 - 100,000 |

---

## User Traffic Patterns

| App Type | Requests/Day/User |
|----------|-------------------|
| Casual app | 10 |
| Social media | 100 |
| Messaging | 500 |
| Heavy app (gaming) | 1,000+ |

### Traffic Multiplier (Average → Peak)

| Service Type | Multiplier |
|--------------|------------|
| Global 24/7 | 2x |
| US-centric (business hours) | 3x |
| Event-driven (flash sales) | 10x+ |

---

## Quick Formulas

### QPS Calculation
```
Average QPS = Daily Requests / 86,400
Peak QPS = Average QPS × Traffic Multiplier
```

### Storage Calculation
```
Total Storage = Items/Day × Item Size × Days × Replication Factor
```

### Bandwidth Calculation
```
Bandwidth (Gbps) = Peak QPS × Avg Request Size (KB) / 125,000
```

### Server Count
```
Servers Needed = Peak QPS / QPS per Server
With Buffer = Servers × 1.5
```

---

## Availability Numbers

| Availability | Downtime/Year | Downtime/Month | Downtime/Day |
|--------------|---------------|----------------|--------------|
| 99% | 3.65 days | 7.2 hours | 14.4 minutes |
| 99.9% | 8.76 hours | 43.8 minutes | 1.44 minutes |
| 99.99% | 52.6 minutes | 4.38 minutes | 8.6 seconds |
| 99.999% | 5.26 minutes | 26.3 seconds | 0.86 seconds |

**Rule:** Each "9" costs ~10x more in engineering effort and infrastructure.

---

## Cost Estimates (AWS 2026)

| Service | Pricing | Use Case |
|---------|---------|----------|
| EC2 t3.xlarge | $150/month | App server |
| RDS db.r5.xlarge | $365/month | Database |
| S3 storage | $0.023/GB/month | Object storage |
| Data transfer (out) | $0.09/GB | Bandwidth |
| CloudFront (CDN) | $0.085/GB | Edge caching |

---

## Estimation Workflow

1. **Clarify requirements** (users, features, SLAs)
2. **Calculate traffic** (DAU → QPS)
3. **Estimate storage** (data size × retention × replication)
4. **Size bandwidth** (QPS × request size)
5. **Count servers** (QPS / server capacity)
6. **Calculate costs** (servers + storage + bandwidth)

---

## Mental Math Shortcuts

### Rounding Rules
- 86,400 → 100,000 (within 15%)
- 31.5M → 30M (within 5%)
- 1,024 → 1,000 (within 2.5%)

### Quick Division
- Divide by 1,000 = ÷ by 10^3
- Divide by 1M = ÷ by 10^6
- Divide by 1B = ÷ by 10^9

### Example
```
10M users × 100 requests/day = 1B requests/day
1B / 100K seconds ≈ 10,000 QPS average
10,000 × 3 (peak) = 30,000 QPS peak
```

---

## Example Calculations

### Instagram Scale
```
DAU: 1 Billion
Requests/user/day: 100
Daily requests: 100 Billion

Average QPS: 100B / 100K = 1M QPS
Peak QPS: 1M × 3 = 3M QPS

Servers (5K QPS each): 3M / 5K = 600 servers
With buffer: 600 × 1.5 = 900 servers
```

### YouTube Scale Storage
```
Uploads: 10M videos/day
Video size: 100 MB average
Daily storage: 10M × 100 MB = 1 PB/day
Yearly: 1 PB × 365 = 365 PB/year

S3 cost: 365M GB × $0.023 = $8.4M/month
Yearly: $100M+ just for storage!
```

---

## Common Interview Questions

**Q: How many servers for 100K QPS?**
```
Assume 5K QPS/server → 100K / 5K = 20 servers
Add 50% buffer → 30 servers
```

**Q: Storage for 1M photos/day for 10 years?**
```
1M photos × 5 MB × 365 days × 10 years × 3 replicas
= 5M MB/day = 5 TB/day
= 5 TB × 3,650 days = 18.25 PB
```

**Q: Bandwidth for 50K QPS with 10 KB responses?**
```
50K QPS × 10 KB = 500,000 KB/s = 500 MB/s = 4 Gbps
```

---

## Print-Friendly Summary

```
MEMORY HIERARCHY
L1: 0.5ns  |  L2: 7ns  |  RAM: 100ns  |  SSD: 150µs  |  Disk: 10ms

TIME CONVERSIONS
1 day = 100K sec  |  1 month = 2.5M sec  |  1 year = 32M sec

STORAGE
1 KB = 10^3  |  1 MB = 10^6  |  1 GB = 10^9  |  1 TB = 10^12

BANDWIDTH
1 Gbps = 125 MB/s  |  10 Gbps = 1.25 GB/s

SERVER QPS
Web: 10K  |  App: 5K  |  DB: 1K  |  Cache: 100K

QPS FORMULA
QPS = Daily Requests / 100K  |  Peak = QPS × 3

STORAGE FORMULA
TB = Items/day × Size × Days × Replication / 10^12
```

---

**Pro tip:** Screenshot this page and save it to your phone. You'll thank yourself during interviews.
