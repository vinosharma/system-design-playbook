Global Sequencer: Distributed Unique ID Generation

Section A: Executive Summary

Problem Statement: Generate unique, 64-bit, time-ordered IDs at a scale of 10M+ TPS with sub-millisecond latency and high availability.

The Winning Stack: * Generation: Snowflake Algorithm (Custom Epoch)

Storage: LSM-Tree (RocksDB/Cassandra internals)

Transport: gRPC with Protocol Buffers

Coordination: Zookeeper (Lease-based Machine ID assignment)

Primary Constraint: Sequential Disk I/O Limits. At this scale, random write patterns in traditional B-Trees cause catastrophic page-split latency and write amplification.

Section B: The Interactive Canvas

Note: This section is designed to host the Interactive Dashboard (HTML/JS). When deploying via GitHub Pages or Vercel, this component provides a real-time simulation of the LSM Write Path and Snowflake bit-masking.

Section C: The Decision Log (ADR Style)

1. Storage Engine: LSM-Tree over B-Tree

Context: We need to persist ID generation logs at 10M TPS.

Decision: Use a Log-Structured Merge-Tree.

Rationale: B-Trees require "update-in-place" operations which trigger random disk I/O. As the index grows, the cost of jumping to leaf nodes becomes a bottleneck. LSM-Trees convert all writes into sequential appends (WAL and SSTable flushes), maximizing hardware throughput.

2. ID Structure: Snowflake over UUIDv4

Context: IDs must be 64-bit and time-sortable.

Decision: Use bit-masked Snowflake IDs.

Rationale: UUIDv4 is 128-bit (double the storage) and completely random, which destroys B-Tree index performance in downstream databases. Snowflake IDs are 64-bit and "K-Ordered," meaning they are roughly sorted by time, keeping downstream indexes efficient.

3. Transport: gRPC over REST/JSON

Context: Minimizing network overhead for 10M requests.

Decision: Use gRPC with client-side batching.

Rationale: JSON serialization is CPU intensive. Protobuf (binary) is much smaller. Client-side batching (requesting 1,000 IDs at once) reduces network interrupts by $1000\times$.

Section D: Failure Mode Analysis

Failure Scenario

Impact

Mitigation Strategy

Zookeeper Cluster Partition

Node ID assignments cannot be refreshed.

Sequencers enter Read-Only/Safety mode; existing leases are honored until expiration to prevent "Split-Brain."

NTP Clock Drift (Backward)

Risk of duplicate ID generation.

The generation logic stores last_timestamp. If current_timestamp < last_timestamp, the node rejects all requests until the clock catches up.

MemTable Saturation

Incoming writes are blocked.

Use "Size-Tiered" compaction to prioritize write ingestion and ensure background flush threads have high priority.

Technical Deep-Dives

LSM Tree Internals

Zookeeper & ZAB Protocol