# 🎯 System Design Fundamentals

> **Master the numbers that power every architecture decision**  
> Quick reference for capacity planning, estimation, and back-of-the-envelope calculations

---

## ⚡ Quick Reference Cards

<details open>
<summary><strong>🚀 Most Important Numbers (Memorize These!)</strong></summary>

| Category | Key Number | Why It Matters |
|----------|------------|----------------|
| ⏱️ **Time** | 86,400 sec/day ≈ **100K** | QPS calculations |
| 💾 **Powers** | 2^10 = 1K, 2^20 = 1M, 2^30 = 1B | Storage & capacity |
| 🌐 **Network** | Cross-region = **150ms** | 300× slower than same datacenter |
| 💿 **Storage** | RAM is **150× faster** than SSD | Cache hot data! |
| 📊 **Traffic** | Peak = Avg × **2-10×** | Always plan for peaks |

</details>

<details>
<summary><strong>📐 Essential Formulas</strong></summary>

| What | Formula | Example |
|------|---------|---------|
| **QPS** | Daily Requests ÷ 86,400 | 10B req/day = 100K QPS |
| **Peak QPS** | Avg QPS × 2-10 | 100K × 3 = 300K peak |
| **Storage** | Items × Size × Days × Replicas | 100M × 5MB × 365 × 3 |
| **Bandwidth** | Peak QPS × Request Size | 100K × 10KB = 1GB/s |
| **Servers** | Peak QPS ÷ QPS/server × 1.5 | 300K ÷ 5K × 1.5 = 90 |

</details>

---

## 📚 Core Concepts

### 1️⃣ What is an ADR?

> **Architecture Decision Record** = Document that captures **WHY** you made a technical choice

**📋 Template:**

| Section | What to Include |
|---------|----------------|
| **Context** | Problem + Constraints (scale, budget, latency) |
| **Decision** | What you chose (tech/pattern) |
| **Rationale** | WHY this choice (numbers + trade-offs) |
| **Consequences** | ✅ Benefits, ❌ Limitations, ⚪ Changes |
| **Alternatives** | What you rejected and why |

**💡 Example:**  
❌ "Learn every feature of Kafka"  
✅ "Why Netflix chose Kafka over RabbitMQ for 1B+ events/day"

<details>
<summary>See full ADR template</summary>

```markdown
# ADR-001: [Decision Title]

## Context
What problem? What constraints (scale/budget/latency)?

## Decision
Chose [Technology/Pattern]

## Rationale
- Numbers that drove the decision
- Trade-off analysis

## Consequences
✅ Gains | ❌ Accept | ⚪ Required changes

## Alternatives
Considered X, Y - rejected because...
```

</details>

---

### 2️⃣ The Power of 2

| Power | Value | Symbol | Memory Aid |
|-------|-------|--------|------------|
| 2^10 | 1,024 | **1K** | Kilobyte |
| 2^20 | 1,048,576 | **1M** | Megabyte |
| 2^30 | 1,073,741,824 | **1B** | Gigabyte |
| 2^40 | 1,099,511,627,776 | **1T** | Terabyte |

**💡 Pro Tip:** Round for speed!  
`1,024 → 1,000` | `86,400 → 100K` | Being within 10% beats being exact but slow

<details>
<summary>Why this matters in practice</summary>

**📦 Storage:**
- 1 KB = 2^10 Bytes
- 1 MB = 2^20 Bytes  
- 1 GB = 2^30 Bytes
- 1 TB = 2^40 Bytes

**🌐 Network:**
- 1 Gbps = 2^30 bits/sec = 125 MB/sec (÷8 for bytes)

**🔑 IDs:**
- 64-bit = 2^64 = 18 quintillion IDs (never run out)
- 32-bit = 2^32 = 4.3B IDs (can run out!)

</details>

---

## Latency Numbers Every Engineer Should Know

These numbers determine whether your architecture will feel "instant" or "slow."

| Operation | Latency | Visual Scale |
|-----------|---------|--------------|
| **🚀 Cache Level** | | |
| L1 cache reference | 0.5 ns | ▏ |
| Branch mispredict | 5 ns | ▏ |
| L2 cache reference | 7 ns | ▏ |
| Mutex lock/unlock | 25 ns | ▎ |
| **💾 Memory Level** | | |
| Main memory reference | 100 ns | █ |
| Compress 1KB (Snappy) | 3 µs | ███ |
| **🌐 Network Level** | | |
| Send 1KB over 1 Gbps | 10 µs | ██████████ |
| Round trip in datacenter | 500 µs | ████████████████████ |
| Send packet CA → Netherlands | 150 ms | ████████████████████████████████ |
| **💿 Storage Level** | | |
| Read 4KB random from SSD | 150 µs | ████████████████ |
| Read 1MB sequential from memory | 250 µs | █████████████████████ |
| Read 1MB sequential from SSD | 1 ms | ████████████████████████████ |
| Disk seek (HDD) | 10 ms | ████████████████████████████████ |
| Read 1MB sequential from disk | 20 ms | ████████████████████████████████ |

### What This Means in Practice

> **Speed Hierarchy** (fastest → slowest)

| Tier | Latency Range | Speed Comparison | Usage |
|------|---------------|------------------|-------|
| 🥇 **Cache** | 0.5ns - 7ns | 10,000× faster than RAM | Hot data, frequently accessed |
| 🥈 **RAM** | 100ns | 150× faster than SSD | Session data, in-memory cache |
| 🥉 **SSD** | 150µs | 100× faster than HDD | Databases, file storage |
| 🐌 **HDD** | 10ms | Avoid for random reads | Cold storage, backups |
| 📡 **Network (same DC)** | 500µs | — | Microservices, cache |
| 🌍 **Network (cross-region)** | 150ms | 300× slower than same DC | User requests, CDN |

> **Golden Rules**

| ✅ Do | ❌ Don't |
|-------|----------|
| Keep hot data in RAM/Cache | Random disk seeks in critical path |
| Use SSD for databases | Cross-region calls in sync flow |
| Cache at edge (CDN) | Multiple network hops for one request |
| Batch network requests | N+1 queries without caching |

### Latency Budget Example

**Goal:** P99 latency < 100ms for a read request

**❌ Naive Approach:**
| Step | Latency | Running Total |
|------|---------|---------------|
| Network (user → server) | 50ms | 50ms |
| Database query | 10ms | 60ms |
| Application processing | 5ms | 65ms |
| Response serialization | 2ms | 67ms |
| Network (server → user) | 50ms | **117ms** ❌ |

**✅ Optimized with CDN:**
| Step | Latency | Running Total |
|------|---------|---------------|
| CDN cache hit (edge) | 5ms | **5ms** ✅ |
| Cache miss → origin (5% of requests) | 117ms | Fallback |

**Result:** `P99 = 5ms × 0.95 + 117ms × 0.05 = 10.6ms` ✅

---

## Time Conversions for Traffic Estimation

### Seconds in Time Periods

| Time Period | Exact Seconds | Approximation |
|-------------|---------------|---------------|
| ⏱️ **1 minute** | 60 | 60 |
| 🕐 **1 hour** | 3,600 | ~4K |
| 📅 **1 day** | 86,400 | ~100K |
| 📆 **1 week** | 604,800 | ~600K |
| 🗓️ **1 month** | 2,592,000 | ~2.5M |
| 📊 **1 year** | 31,536,000 | ~32M |

### Traffic Estimation Formula

> **📊 Core Formula**
>
> `Average QPS = Total Daily Requests ÷ 86,400 seconds`  
> `Peak QPS = Average QPS × Traffic Multiplier`

**Traffic Multiplier** (depends on usage pattern):

| Pattern | Multiplier | Examples |
|---------|------------|----------|
| 🌍 **Global 24/7** | 2× | Social media, messaging |
| 🇺🇸 **US Peak Hours** | 3× | E-commerce, news |
| 🎯 **Event-Driven** | 10×+ | Flash sales, live events |

### Example: Social Media App

**📝 Given:**
- 10M DAU (Daily Active Users)
- Each user makes 100 requests/day

**🧮 Calculate:**

| Step | Calculation | Result |
|------|-------------|--------|
| 1️⃣ Daily Requests | 10M users × 100 req/user | **1B requests/day** |
| 2️⃣ Average QPS | 1B ÷ 86,400 ≈ 1B ÷ 100K | **10,000 QPS** |
| 3️⃣ Peak QPS | 10,000 × 3 (US peak) | **30,000 QPS** |

**🖥️ Infrastructure Needed:**

| Component | Calculation | Result |
|-----------|-------------|--------|
| Servers (base) | 30,000 ÷ 1,000 QPS per server | 30 servers |
| + 50% buffer | 30 × 1.5 | **45 servers total** ✅ |

---

## Storage Sizes & Data Estimation

### Storage Units

| Unit | Exact | Approximation | Scientific |
|------|-------|---------------|------------|
| 💾 **Byte** | 8 bits | — | — |
| 📄 **Kilobyte (KB)** | 1,024 Bytes | ~1,000 Bytes | 10³ |
| 📁 **Megabyte (MB)** | 1,024 KB | ~1 Million Bytes | 10⁶ |
| 💿 **Gigabyte (GB)** | 1,024 MB | ~1 Billion Bytes | 10⁹ |
| 🗄️ **Terabyte (TB)** | 1,024 GB | ~1 Trillion Bytes | 10¹² |
| 🏢 **Petabyte (PB)** | 1,024 TB | — | 10¹⁵ |

### Common Data Sizes

| Data Type | Size | Notes |
|-----------|------|-------|
| **📝 Basic Types** | | |
| ASCII character | 1 Byte | English letters, numbers |
| Unicode character (UTF-8) | 1-4 Bytes | Average: 2 Bytes |
| Integer (32-bit) | 4 Bytes | Standard int |
| Long/Timestamp (64-bit) | 8 Bytes | Unix timestamp |
| UUID | 16 Bytes | Unique identifier |
| **🌐 Network** | | |
| IPv4 address | 4 Bytes | 192.168.1.1 |
| IPv6 address | 16 Bytes | Modern IP format |
| **💬 Content** | | |
| Short text (Tweet) | ~500 Bytes | 280 chars + metadata |
| Database row | ~1 KB | Typical size |
| **🖼️ Media** | | |
| Thumbnail | 50 KB | Small preview |
| Profile picture | 200 KB | Medium image |
| Photo (high-res) | 5 MB | Full quality |
| HD video (1 hour) | 3 GB | 1080p |
| 4K video (1 hour) | 15 GB | Ultra HD |

### Storage Estimation Example

**Problem:** How much storage for 1 year of tweets?

**📝 Given:**
- 500M tweets/day (Twitter scale)
- Each tweet: 500 Bytes (280 chars + metadata)

**🧮 Calculate:**

| Step | Calculation | Result |
|------|-------------|--------|
| 1️⃣ Daily Storage | 500M × 500 Bytes | **250 GB/day** |
| 2️⃣ Yearly Storage | 250 GB × 365 days | **91.25 TB/year** |
| 3️⃣ With Replication | 91.25 TB × 3 replicas | **274 TB/year** |

**💰 Cost Estimate (AWS S3):**

| Item | Calculation | Cost |
|------|-------------|------|
| Storage | 274 TB = 274,000 GB | — |
| Price | 274,000 × $0.023/GB/month | **$6,302/month** |
| Annual | $6,302 × 12 | **$75,624/year** 💸 |

---

## Network Bandwidth & Transfer Times

### Bandwidth Units

| Unit | Bits/Second | Bytes/Second |
|------|-------------|-------------|
| 🐌 **1 Kbps** | 1,000 | 125 Bytes/s |
| 📶 **1 Mbps** | 1,000,000 | 125 KB/s |
| 🚀 **1 Gbps** | 1,000,000,000 | 125 MB/s |
| ⚡ **10 Gbps** | 10,000,000,000 | 1.25 GB/s |

**Remember:** Divide by 8 to convert bits to bytes (network uses bits, storage uses bytes).

### Transfer Time Formula

```
Transfer Time = Data Size / Bandwidth
```

### Examples

**Transfer 1 GB over different bandwidths:**

| Bandwidth | Speed | Transfer Time | Experience |
|-----------|-------|---------------|------------|
| 1 Mbps | 0.125 MB/s | ~2.2 hours | 🐌 Painful |
| 10 Mbps | 1.25 MB/s | ~13 minutes | 😐 Slow |
| 100 Mbps | 12.5 MB/s | ~1.3 minutes | 🙂 Acceptable |
| 1 Gbps | 125 MB/s | ~8 seconds | ✅ Fast |
| 10 Gbps | 1,250 MB/s | ~0.8 seconds | ⚡ Blazing |

**🌐 Real-World Scenario:**

| Item | Value |
|------|-------|
| User uploads | 10MB photo |
| Upload speed | 5 Mbps = 0.625 MB/s |
| Transfer time | 10 MB ÷ 0.625 MB/s | 
| **Result** | **16 seconds** ⏱️ |

---

## Server Capacity Rules of Thumb

**These are approximations.** Actual capacity depends on request complexity, CPU, RAM, and optimization.

### QPS (Queries Per Second) per Server

| Server Type | QPS Range | Use Case |
|-------------|-----------|----------|
| 🌐 **Web Server** (Nginx/Apache) | 1,000 - 10,000 | Static content, reverse proxy |
| ⚙️ **App Server** (Node/Java) | 500 - 5,000 | Business logic |
| 🗄️ **Database** (read-heavy) | 1,000 - 5,000 | PostgreSQL, MySQL |
| ✍️ **Database** (write-heavy) | 100 - 1,000 | Writes are expensive |
| ⚡ **Cache** (Redis) | 100,000 - 500,000 | In-memory, blazing fast |
| 📨 **Message Queue** (Kafka) | 50,000 - 100,000 | Event streaming |

### Memory Capacity

| Server Type | RAM Range | Purpose |
|-------------|-----------|----------|
| 🌐 **Web Server** | 16 - 64 GB | Request handling |
| ⚙️ **App Server** | 32 - 128 GB | Business logic |
| 🗄️ **Database** | 64 - 512 GB | Query cache, buffers |
| ⚡ **Cache** (Redis) | 256 GB - 1 TB | Hot data storage |

### Storage Capacity

| Storage Type | Capacity | Notes |
|--------------|----------|-------|
| 💿 **Server SSD** | 1 - 4 TB | Local storage |
| 🗄️ **Database** | 10 - 100 TB | RAID setup |
| ☁️ **Object Storage** (S3) | Unlimited | Pay per GB |

### Example Sizing

**Problem:** How many servers for 50,000 QPS?

**📝 Assumptions:**
- Each app server: 2,500 QPS
- Need headroom for failures: 50% buffer

**🧮 Calculate:**

| Step | Calculation | Result |
|------|-------------|--------|
| 1️⃣ Base Servers | 50,000 ÷ 2,500 | 20 servers |
| 2️⃣ + Safety Buffer | 20 × 1.5 (50%) | **30 servers** ✅ |

---

## User Traffic Patterns (DAU → QPS)

### Average Requests per User per Day

| App Type | Requests/Day/User | Examples |
|----------|-------------------|----------|
| 🌤️ **Casual** | ~10 | Weather, News |
| 📱 **Social Media** | ~100 | Twitter, Instagram |
| 💬 **Messaging** | ~500 | WhatsApp, Telegram |
| 🎮 **Heavy Usage** | 1,000+ | Gaming, Trading |

### DAU to QPS Conversion

> **📊 Formula**
>
> `Total Daily Requests = DAU × Requests per User per Day`  
> `Average QPS = Total Daily Requests ÷ 86,400 seconds`  
> `Peak QPS = Average QPS × Traffic Multiplier`

### Example: Instagram-scale

**📝 Given:**
- 1 Billion DAU
- 100 requests/day/user
- Traffic multiplier: 3× (US/Europe peak hours)

**🧮 Calculate:**

| Step | Calculation | Result |
|------|-------------|--------|
| 1️⃣ Daily Requests | 1B users × 100 req | **100B requests/day** |
| 2️⃣ Average QPS | 100B ÷ 86,400 ≈ 100B ÷ 100K | **1M QPS** |
| 3️⃣ Peak QPS | 1M × 3 | **3M QPS** |

**🖥️ Infrastructure Estimate:**

| Component | Calculation | Scale |
|-----------|-------------|-------|
| Servers (base) | 3M QPS ÷ 5K QPS/server | 600 servers |
| With replication | Across multiple regions | **2,000+ servers globally** 🌍 |

---

## The Estimation Framework

Follow this step-by-step process for ANY system design problem.

### Step 1: Clarify Requirements

**Functional:**
- What does the system do? (store, process, serve)
- What features are in scope?

**Non-Functional:**
- Scale: How many users? How much data?
- Performance: What's the latency target? (P50, P99)
- Availability: 99.9%? 99.99%? 99.999%?

### Step 2: Estimate Scale

**Users:**
- DAU (Daily Active Users)
- MAU (Monthly Active Users)
- Growth rate (year-over-year)

**Traffic:**
- Requests per user per day
- Average QPS
- Peak QPS (2-10x average)

### Step 3: Calculate Storage

> **📊 Formula**
>
> `Total Storage = Items/Day × Item Size × Retention Days × Replication Factor`

**💡 Example:**

| Component | Value | Calculation |
|-----------|-------|-------------|
| Photos/day | 100M | — |
| Photo size | 5 MB | — |
| Retention | 365 days | 1 year |
| Replication | 3× | For redundancy |
| **Result** | — | **100M × 5 × 365 × 3 = 547.5 TB/year** 📦 |

### Step 4: Estimate Bandwidth

> **📊 Formula**
>
> `Bandwidth = Peak QPS × Average Request Size`

**💡 Example:**

| Component | Value |
|-----------|-------|
| Peak QPS | 100,000 |
| Avg request size | 10 KB |
| Bandwidth (KB/s) | 100,000 × 10 = 1,000,000 KB/s |
| Bandwidth (GB/s) | 1,000,000 KB ÷ 1,000,000 = **1 GB/s** |
| Bandwidth (Gbps) | 1 GB/s × 8 = **8 Gbps** 🚀 |

### Step 5: Calculate Server Count

> **📊 Formula**
>
> `Servers Needed = Peak QPS ÷ QPS per Server`  
> `Add Buffer = Servers × 1.5` (for failures, maintenance)

**💡 Example:**

| Step | Calculation | Result |
|------|-------------|--------|
| Peak QPS | Given | 50,000 |
| QPS/server | Assumption | 2,500 |
| Base servers | 50,000 ÷ 2,500 | 20 |
| **With buffer** | 20 × 1.5 | **30 servers** ✅ |

### Step 6: Estimate Costs

**AWS rough pricing (2026):**

| Service | Instance Type | Hourly | Monthly |
|---------|---------------|--------|----------|
| 💻 **Compute** | EC2 (t3.xlarge) | $0.20/hour | $150/month |
| 🗄️ **Database** | RDS (db.r5.xlarge) | $0.50/hour | $365/month |
| 📦 **Storage** | S3 | — | $0.023/GB/month |
| 📡 **Data Transfer** | Outbound | — | $0.09/GB |

---

## Practice Problems

### Problem 1: URL Shortener

**Requirements:**
- 100M new URLs/day
- Read:Write ratio = 100:1
- Each URL record: 500 Bytes

**Questions:**
1. Calculate daily write QPS
2. Calculate daily read QPS
3. Estimate storage needed for 5 years
4. How many servers for read traffic?

<details>
<summary>Click to see solution</summary>

**1️⃣ Write QPS:**

| Calculation | Result |
|-------------|--------|
| 100M URLs/day ÷ 86,400 seconds | ≈ 100M ÷ 100K |
| **Write QPS** | **1,000 writes/sec** ✍️ |

**2️⃣ Read QPS:**

| Calculation | Result |
|-------------|--------|
| Reads = Writes × 100 | 100M × 100 = 10B reads/day |
| Read QPS | 10B ÷ 86,400 ≈ 10B ÷ 100K |
| Average | 100,000 reads/sec |
| **Peak (2×)** | **200,000 reads/sec** 👀 |

**3️⃣ Storage (5 years):**

| Step | Calculation | Result |
|------|-------------|--------|
| Daily storage | 100M URLs × 500 Bytes | 50 GB/day |
| 5 years | 50 GB × 365 × 5 | 91.25 TB |
| **With replication (3×)** | 91.25 × 3 | **274 TB** 📦 |

**4️⃣ Servers for reads:**

| Step | Calculation | Result |
|------|-------------|--------|
| Assumption | Each server: 10,000 read QPS | — |
| Base servers | 200,000 ÷ 10,000 | 20 servers |
| **With buffer (1.5×)** | 20 × 1.5 | **30 servers** ✅ |

</details>

---

### Problem 2: Video Platform

**Requirements:**
- 10M video uploads/day
- Average video size: 100 MB
- 100M video views/day
- Retention: 10 years

**Questions:**
1. Daily upload bandwidth needed
2. Daily download bandwidth needed
3. Total storage after 10 years
4. Monthly storage cost (S3 pricing)

<details>
<summary>Click to see solution</summary>

**1️⃣ Upload Bandwidth:**

| Step | Calculation | Result |
|------|-------------|--------|
| Daily uploads | 10M videos × 100 MB | 1,000,000 GB = 1 PB/day |
| Per second | 1 PB ÷ 86,400 sec | ≈ 11.6 GB/sec |
| **Bandwidth** | 11.6 GB/s × 8 | **92.8 Gbps** 📤 |

**2️⃣ Download Bandwidth:**

| Step | Calculation | Result |
|------|-------------|--------|
| Daily views | 100M views × 100 MB | 10,000,000 GB = 10 PB/day |
| Per second | 10 PB ÷ 86,400 sec | ≈ 116 GB/sec |
| **Bandwidth** | 116 GB/s × 8 | **928 Gbps** 📥 |

**3️⃣ Total Storage (10 years):**

| Step | Calculation | Result |
|------|-------------|--------|
| Daily storage | 10M × 100 MB | 1 PB/day |
| 10 years | 1 PB × 365 × 10 | 3,650 PB |
| **Total** | — | **3.65 Exabytes** 🤯 |

**4️⃣ Monthly Cost:**

| Item | Calculation | Result |
|------|-------------|--------|
| S3 pricing | $0.023/GB/month | — |
| Storage | 3.65 EB = 3,650,000,000 GB | — |
| **Monthly cost** | 3,650,000,000 × $0.023 | **$83,950,000** 💸 |

> 💡 **Why YouTube costs billions to run!**

</details>

---

## Key Takeaways

1. **Memorize the fundamentals**: Powers of 2, latency numbers, time conversions
2. **Round for speed**: 86,400 → 100K is fine for estimates
3. **Account for peaks**: Traffic is NOT uniform (2-10x multiplier)
4. **Add buffers**: Always plan for 50% extra capacity
5. **Think in orders of magnitude**: Is it 1K, 1M, or 1B? That's what matters.
6. **Latency kills UX**: One cross-region hop (150ms) can ruin your product
7. **Storage is cheap, bandwidth is expensive**: Design accordingly
8. **Cache aggressively**: RAM is 150x faster than SSD

---

## Next Steps

Now that you have the fundamentals, apply them:

1. **[Estimation Cheat Sheet](./estimation-cheatsheet.md)** - Quick reference tables
2. **[Global Sequencer ADR](../global-sequencer/README.md)** - See these principles in action
3. **Practice**: Take any popular service (Twitter, Uber, Netflix) and estimate their infrastructure

---

**Remember:** The goal is NOT to be exact. The goal is to be **reasonably close** in a **short amount of time**.

> "All models are wrong, but some are useful." - George Box

An estimate that's 80% accurate in 5 minutes is infinitely more valuable than a perfect calculation that takes 2 hours.
