import fs from "fs"
import { buildApiSnapshot } from "./apiMetricsSnapshot"
import { apiMetrics } from "./apiMetrics"
console.log("⏱ metrics writer file loaded");
setInterval(() => {
    const snapshot = buildApiSnapshot();
    fs.appendFileSync(
        "./api-metrics.json",
        JSON.stringify(snapshot) + "\n",
        { encoding: "utf-8" }
    );


    apiMetrics.requestCount = 0;
    apiMetrics.errorCount = 0;
    apiMetrics.durations = [];
    apiMetrics.queuePublishCount = 0;
    apiMetrics.queuePublishError = 0;
}, 60_000)