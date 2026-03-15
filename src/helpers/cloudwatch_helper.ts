import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch";
import type { CloudWatchClientConfig } from "@aws-sdk/client-cloudwatch";
import dotenv, { config } from "dotenv"
import { AppConfig, configs } from "../app.config";
dotenv.config();

export class CloudWatchMetric {
    private client: CloudWatchClient;
    private _config : AppConfig;

    constructor(appConfig: AppConfig = configs) {
        this._config = appConfig;
        const config = {};
        this.client = new CloudWatchClient({
            region : this._config.awsRegion as string,
            credentials: {
                accessKeyId: this._config.awsAccessKey as string,
                secretAccessKey : this._config.awsSecretAccessKey as string
            }
        });
    }

    async send(command: PutMetricDataCommand) {
        return this.client.send(command)
    }
}