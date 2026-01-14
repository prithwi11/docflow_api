import { apiMetrics } from "./apiMetrics";

function percentile(arr: number[], p: number) {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a,b) => a-b);
    const idx = Math.ceil((p/100) * sorted.length) - 1;
    return sorted[idx];
}

export function buildApiSnapshot() {
    const count = apiMetrics.requestCount;

    return {
        timestamp: new Date().toISOString(),
        window: '60s',
        upload_api: {
            request_rate: count / 60,
            response_time_p50: percentile(apiMetrics.durations, 50),
            response_time_p95: percentile(apiMetrics.durations, 95),
            response_time_p99: percentile(apiMetrics.durations, 99),
            error_rate: apiMetrics.errorCount / Math.max(count, 1),
            success_rate: (count - apiMetrics.errorCount) / Math.max(count, 1)
        }
    }
}