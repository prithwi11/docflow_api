import mongoose, { Connection, Schema, Model } from "mongoose";
import dotenv from "dotenv"
dotenv.config()
import { AppConfig, configs } from "../../app.config";

export class TestDatabase {
    private connection: Connection | null = null;
    private _config: AppConfig;

    constructor(appConfig: AppConfig = configs) {
        this._config = appConfig;
    }

    async connect(): Promise<Connection> {
        const connectionUri: string = `${this._config.mongoUri}/${this._config.dbName}`;
        this.connection = await mongoose.createConnection(connectionUri, {
            maxPoolSize: 5,
        }).asPromise();
        return this.connection;
    }

    async dropDatabase() {
        if (!this.connection) throw new Error("No connection");
        await this.connection.dropDatabase();
    }

    async close() {
        if (this.connection) {
            await this.connection.close()
        }
    }

    getConnection(): Connection {
        if (!this.connection) throw new Error("Connection not established");
        return this.connection;
    }
}