import mongoose, { Connection } from "mongoose";
import { AppConfig, configs } from "../app.config";

export class ConnectionTODB {
    private _config: AppConfig;
    constructor(appConfig: AppConfig = configs) {
        this._config = appConfig
    }
    async connect(): Promise<Connection> {
        const mongoUri = this._config.mongoUri as string;
        const dbName = this._config.dbName as string;

        const connectionUri = `${mongoUri}/${dbName}`;

        await mongoose.connect(connectionUri, {
            retryWrites: true,
            w: "majority"
        });

        console.log("MongoDB Connected");

        return mongoose.connection;
    }
}