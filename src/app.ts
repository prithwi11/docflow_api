import express from "express"
import http from "http"
import cors from "cors"
import dotenv, { config } from "dotenv"
import { ConnectionTODB } from "./configuration/config"
import { Sequelize } from "sequelize"
import { SqsHelper } from "./helpers/sqs_helper"
import "./Metrics/apiMetricsListener"
import "./Metrics/apiMetricsWriter";
import { Mongoose } from "mongoose";
import { winstonlog } from "./configuration/winston"
import { LOGGER_SETTINGS } from "./configuration/log_config"
import pathModule from "path"
import { createAppRouter } from "./app_routing"

let winlog = new winstonlog(LOGGER_SETTINGS); // Logger settings From env

dotenv.config()
const app = express()
const server = http.createServer()
const PORT = Number(process.env.PORT) || 3000
// global.connectionObj = connection.connectToPgDB();

const sqs_helper = new SqsHelper();
global.SQS_HELPER = sqs_helper;
global.logs = winlog;
global.path = pathModule;

// app.use(express.json({limit : '150mb'}));
// app.use(express.urlencoded({limit : '150mb', extended : true}));
declare global {
    var connectionObj: Sequelize;
    var SQS_HELPER: typeof sqs_helper;
    var mongo_connection: typeof Mongoose | unknown;
    var logs : typeof winlog;
    var path : typeof pathModule;
}
/** ALLOW CORS */
app.use(cors({
    origin : "*",
    optionsSuccessStatus : 200
}))

app.get('/v1/health', (_req: any, res: any) => {
    res.json({status : 'server is running'})
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


winlog.initiateLoggingSystem();
(async () => {

    const connectionService = new ConnectionTODB();
    const mongoConnection = await connectionService.connect();

    app.use("/v1", createAppRouter(mongoConnection));

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
    });

})();