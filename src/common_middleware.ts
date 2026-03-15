import { Request, Response, NextFunction } from "express";
import { CloudWatchMetric } from "./helpers/cloudwatch_helper";
import { PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";
export class CommonMiddleware {
    private cloudWatch = new CloudWatchMetric();
    constructor() {}

    trackRequest = async (req: Request, res: Response, next : NextFunction): Promise<void> => {
        const start = Date.now();

        res.on("finish", async() => {
            let duration = Date.now() - start;
            console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`)
        

            try {
                this.cloudWatch.send(
                  new PutMetricDataCommand({
                    Namespace: "DocFlow/API",
                    MetricData: [
                      {
                        MetricName: "RequestDuration",
                        Unit: "Milliseconds",
                        Value: duration,
                        StorageResolution: 1,
                      },
                      {
                        MetricName: "RequestCount",
                        Unit: "Count",
                        Value: 1,
                      },
                    ],
                  })
                );
                  
            }
            catch(error: any) {
                console.error("CloudWatch metric error:", error);
            }
        });

        next();
    }
}