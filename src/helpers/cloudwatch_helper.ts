import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import type { CloudWatchClientConfig } from "@aws-sdk/client-cloudwatch";
import dotenv, { config } from "dotenv"
dotenv.config();

export class CloudWatchMetric {
    private client: CloudWatchClient;

    constructor() {
        const config = {};
        this.client = new CloudWatchClient({
            region : process.env.AWS_DEFAULT_REGION as string,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY as string,
                secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY as string
            }
        });
    }

    async send(command: PutMetricDataCommand) {
        return this.client.send(command)
    }
}