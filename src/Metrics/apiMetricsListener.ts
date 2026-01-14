import { metricsEmitter } from "./metricsEmitter";
import { apiMetrics } from "./apiMetrics";

metricsEmitter.on("api_request_complete", (data: any) => {
    apiMetrics.requestCount++;
    apiMetrics.durations.push(data.durationMs);
    if (!data.success) {
        apiMetrics.errorCount++
    }
});

metricsEmitter.on("queue_publish_success", () => {
    apiMetrics.queuePublishCount++
});

metricsEmitter.on("queue_publish_error", () => {
    apiMetrics.queuePublishError++
})