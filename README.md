High-Throughput Asynchronous Image Processor
A resilient, distributed image processing system built with Node.js and RabbitMQ, capable of handling flash-traffic surges and ensuring data integrity through atomic locking.

System Architecture
Engineering Experiments
# Experiment 1 : Latency & Throughput
1. User uploads image → Multer writes to disk
2. Read image back from disk 
3. Sharp processes/compresses it synchronously
4. Write compressed image to disk
5. Send response

Tested with 1000 VUs for 30s using k6
Results : p(95) - 33.610s, 2. Avg Response Time : 12.580s, 3. Throughput : 23.2req/s

1. The Problem : Initial synchronous processing on the main thread caused latency and blocked the event loop
2. The Action : Offloaded the task to a separate worker service using RabbitMQ
3. The Result : p(95) - 4.15s, Avg Response Time - 2.25s, Througgput - 128.438727 req/s

# Experiment 2 : Distributed Locking (Idempotency)
1. Situation
    When scaling image processing horizontally, the same image was occasionally processed multiple times. This happened when duplicate messages were consumed by multiple workers simultaneously.
2. Task
    I needed to guarantee idempotent processing while allowing parallel consumers without introducing distributed locks or excessive overhead.
3. Action
    I initially tried checking image status at the database level, but concurrent workers could still pass the check due to race conditions.

    To fix this, I introduced a job-claiming mechanism. Before processing, a worker would atomically create or claim a job record using a database findOneAndUpdate operation. This ensured that only one worker could claim an image for processing.

    If a job already existed in pending or processing state, the worker would skip processing.
4. Result
    This completely eliminated duplicate processing while keeping the system horizontally scalable. The added latency was minimal and acceptable compared to the correctness guarantees.

# STORY 3 — “Handling Backpressure, Retry Storms, and Autoscaling Under Burst Traffic”
1. Situation
    During load testing, we simulated flash traffic—about 100 messages per second for several seconds. Processing time increased sharply, especially when CPU contention or memory pressure was introduced.
2. Task
    I needed to ensure the system degraded gracefully under load instead of failing or retrying uncontrollably.
3. Action
    First, I tested retry behavior by re-queueing failed messages. This immediately caused retry storms where failing jobs blocked valid ones.
    I fixed this by introducing bounded retries with exponential backoff and a Dead Letter Queue for failed jobs. This isolated problematic messages without impacting the healthy ones.
    For legitimate traffic spikes, instead of rate limiting—which would hurt real users—I implemented autoscaling by dynamically spawning additional worker processes based on processing latency and queue depth.
4. Result
    The system handled burst traffic smoothly, processing latency dropped significantly, and failure scenarios became observable and manageable through the DLQ.