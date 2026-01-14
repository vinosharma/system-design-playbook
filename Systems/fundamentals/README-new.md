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

**📋 Quick Template:**

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
<summary>See practical applications</summary>

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

### 3️⃣ Latency Numbers (Speed Hierarchy)

> **Remember:** Cache → RAM → SSD → HDD → Network (cross-region)

| What Matters | Latency | Rule |
|--------------|---------|------|
| 🥇 **L1 Cache** | 0.5 ns | 10,000× faster than RAM |
| 🥈 **RAM** | 100 ns | 150× faster than SSD |
| 🥉 **SSD** | 150 µs | 100× faster than HDD |
| 🐌 **HDD** | 10 ms | ❌ Avoid random reads |
| 📡 **Same datacenter** | 500 µs | ✅ Microservices OK |
| 🌍 **Cross-region** | 150 ms | ⚠️ Use CDN |

**Golden Rules:**
- ✅ Keep hot data in RAM/Cache
- ✅ Use SSD for databases (not HDD)
- ❌ Never do random disk seeks in critical path
- ❌ No cross-region calls in sync flow

**💡 Real Example:** P99 latency < 100ms

| Approach | Latency | Status |
|----------|---------|--------|
| ❌ Direct DB query (cross-region) | 50ms + 10ms + 50ms = **110ms** | Over budget |
| ✅ CDN edge cache | **5ms** (95% hit rate) | Under budget |

---

### 4️⃣ Time Conversions

| Period | Seconds | Round To |
|--------|---------|----------|
| 1 day | 86,400 | **~100K** ⭐ |
| 1 hour | 3,600 | ~4K |
| 1 week | 604,800 | ~600K |
| 1 month | 2,592,000 | ~2.5M |
| 1 year | 31,536,000 | ~32M |

**🧮 QPS Quick Calc:**

| Input | Formula | Output |
|-------|---------|--------|
| Daily Requests | 1B/day | ÷ 100K = **10K avg QPS** |
| Peak Multiplier | × 3 (US peak) | **30K peak QPS** |
| Servers Needed | 30K ÷ 1K × 1.5 | **45 servers** |

---

### 5️⃣ Storage & Bandwidth

**📦 Common Data Sizes:**

| Type | Size | Example |
|------|------|---------|
| Tweet | 500 B | 280 chars + metadata |
| DB row | 1 KB | Typical |
| Photo | 5 MB | High-res |
| HD video (1hr) | 3 GB | 1080p |
| 4K video (1hr) | 15 GB | Ultra HD |

**🌐 Bandwidth:**

| Speed | Transfer 1GB | Use Case |
|-------|--------------|----------|
| 1 Mbps | ~2.2 hours | 🐌 Painful |
| 100 Mbps | ~1.3 min | 😊 OK |
| 1 Gbps | 8 sec | ✅ Fast |
| 10 Gbps | 0.8 sec | ⚡ Blazing |

---

### 6️⃣ Server Capacity (Rules of Thumb)

| Server Type | QPS | RAM | Use |
|-------------|-----|-----|-----|
| 🌐 Web (Nginx) | 1K-10K | 16-64 GB | Static/proxy |
| ⚙️ App (Node) | 500-5K | 32-128 GB | Logic |
| 🗄️ DB (read) | 1K-5K | 64-512 GB | Postgres |
| ⚡ Cache (Redis) | 100K-500K | 256GB-1TB | Hot data |

**⚠️ Remember:** Add 50% buffer for failures!

---

### 7️⃣ User Traffic Patterns

| App Type | Req/User/Day | Examples |
|----------|--------------|----------|
| Casual | 10 | Weather |
| Social | 100 | Instagram |
| Messaging | 500 | WhatsApp |
| Heavy | 1,000+ | Gaming |

---

## 🧮 6-Step Estimation Framework

<details open>
<summary><strong>Step 1: Clarify Requirements</strong></summary>

| Question | Example Answer |
|----------|---------------|
| Scale? | 100M DAU |
| Latency? | P99 < 100ms |
| Availability? | 99.99% |
| Features? | Read/write posts, timeline |

</details>

<details>
<summary><strong>Step 2: Estimate Traffic</strong></summary>

| Step | Calculation | Result |
|------|-------------|--------|
| Daily Requests | 100M DAU × 100 req | 10B/day |
| Avg QPS | 10B ÷ 100K | 100K QPS |
| Peak QPS | 100K × 3 | **300K QPS** |

</details>

<details>
<summary><strong>Step 3: Calculate Storage</strong></summary>

| Component | Value | Formula |
|-----------|-------|---------|
| Photos/day | 100M | — |
| Photo size | 5 MB | — |
| Retention | 365 days | — |
| Replication | 3× | — |
| **Result** | — | **100M × 5 × 365 × 3 = 547.5 TB/year** 📦 |

</details>

<details>
<summary><strong>Step 4: Bandwidth</strong></summary>

| Component | Calculation | Result |
|-----------|-------------|--------|
| Peak QPS | 100K | — |
| Request size | 10 KB | — |
| Bandwidth | 100K × 10KB | **1 GB/s = 8 Gbps** 🚀 |

</details>

<details>
<summary><strong>Step 5: Server Count</strong></summary>

| Step | Calculation | Result |
|------|-------------|--------|
| Peak QPS | 300K | — |
| QPS/server | 5K | — |
| Base | 300K ÷ 5K | 60 |
| + Buffer | 60 × 1.5 | **90 servers** ✅ |

</details>

<details>
<summary><strong>Step 6: Cost Estimate</strong></summary>

| Service | Instance | Monthly |
|---------|----------|---------|
| 💻 Compute | EC2 t3.xlarge | $150 |
| 🗄️ Database | RDS r5.xlarge | $365 |
| 📦 Storage | S3 | $0.023/GB |
| 📡 Transfer | Outbound | $0.09/GB |

</details>

---

## 💼 Practice Problems

### Problem 1: URL Shortener

**Requirements:**
- 100M new URLs/day
- Read:Write ratio = 100:1
- Each URL record: 500 Bytes

<details>
<summary>Click to see solution</summary>

**1️⃣ Write QPS:**

| Calculation | Result |
|-------------|--------|
| 100M URLs/day ÷ 100K | **1,000 writes/sec** ✍️ |

**2️⃣ Read QPS:**

| Step | Calculation | Result |
|------|-------------|--------|
| Daily reads | 100M × 100 | 10B/day |
| Avg read QPS | 10B ÷ 100K | 100K reads/sec |
| **Peak (2×)** | 100K × 2 | **200K reads/sec** 👀 |

**3️⃣ Storage (5 years):**

| Step | Calculation | Result |
|------|-------------|--------|
| Daily | 100M × 500B | 50 GB/day |
| 5 years | 50GB × 365 × 5 | 91.25 TB |
| **With 3× replication** | 91.25 × 3 | **274 TB** 📦 |

**4️⃣ Servers:**

| Calculation | Result |
|-------------|--------|
| 200K ÷ 10K QPS/server | 20 servers |
| **+ 50% buffer** | **30 servers** ✅ |

</details>

---

### Problem 2: Video Platform

**Requirements:**
- 10M video uploads/day
- Average video size: 100 MB
- 100M video views/day

<details>
<summary>Click to see solution</summary>

**1️⃣ Upload Bandwidth:**

| Step | Calculation | Result |
|------|-------------|--------|
| Daily uploads | 10M × 100MB | 1 PB/day |
| Per second | 1PB ÷ 86,400 | ~11.6 GB/sec |
| **Bandwidth** | 11.6 GB/s × 8 | **92.8 Gbps** 📤 |

**2️⃣ Download Bandwidth:**

| Step | Calculation | Result |
|------|-------------|--------|
| Daily views | 100M × 100MB | 10 PB/day |
| Per second | 10PB ÷ 86,400 | ~116 GB/sec |
| **Bandwidth** | 116 GB/s × 8 | **928 Gbps** 📥 |

**3️⃣ Storage (10 years):**

| Calculation | Result |
|-------------|--------|
| 10M × 100MB × 365 × 10 | **3.65 Exabytes** 🤯 |

**4️⃣ Monthly Cost:**

| Item | Calculation | Result |
|------|-------------|--------|
| S3 | 3.65EB × $0.023/GB | **$83,950,000** 💸 |

> 💡 **Why YouTube costs billions to run!**

</details>

---

## ✨ Key Takeaways

| Concept | Remember |
|---------|----------|
| 🎯 **Estimation Goal** | Be within 10%, not exact |
| ⏱️ **Magic Number** | 86,400 → 100K for QPS calc |
| 📊 **Peak Traffic** | 2-10× average, plan for it |
| 💾 **Speed Hierarchy** | Cache > RAM > SSD > HDD > Network |
| 🛡️ **Safety Buffer** | Always add 50% extra capacity |
| 🌍 **Latency Killer** | Cross-region = 150ms (use CDN!) |
| 💰 **Cost Reality** | Storage cheap, bandwidth expensive |

---

## 🚀 Next Steps

| Resource | Purpose |
|----------|---------|
| [Estimation Cheat Sheet](./estimation-cheatsheet.md) | Print-friendly quick reference |
| [Global Sequencer ADR](../global-sequencer/README.md) | See these principles in action |
| **Practice** | Estimate Twitter, Uber, Netflix infrastructure |

---

**Remember:** The goal is **reasonable accuracy** in a **short time**, not perfection! 🎯
