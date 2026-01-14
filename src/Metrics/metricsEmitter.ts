import EventEmitter from "events";

export const metricsEmitter = new EventEmitter();

// Global metrics objects
export const apiMetrics = {
    requestCount: 0,
    errorCount: 0,
    durations: [] as number[],        // API response durations
    endToEndDurations: [] as number[],// End-to-end latency
    queuePublishCount: 0,
    queuePublishError: 0,
  };
  
  export const workerMetrics = {
    consumedCount: 0,
    processingDuration: [] as number[], // Worker processing durations
    failedCount: 0,
  };