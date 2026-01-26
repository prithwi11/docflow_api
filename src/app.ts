import express from "express"
import http from "http"
import cors from "cors"
import dotenv, { config } from "dotenv"
import { Connection } from "./configuration/config"
import { Sequelize } from "sequelize"
import { SqsHelper } from "./helpers/sqs_helper"
import "./Metrics/apiMetricsListener"
import "./Metrics/apiMetricsWriter";
import { Mongoose } from "mongoose"

dotenv.config()
const app = express()
const server = http.createServer()
const PORT = Number(process.env.PORT) || 3000

let connection = new Connection();
// global.connectionObj = connection.connectToPgDB();
global.mongo_connection = connection.connect();

const sqs_helper = new SqsHelper();
global.SQS_HELPER = sqs_helper;

// app.use(express.json({limit : '150mb'}));
// app.use(express.urlencoded({limit : '150mb', extended : true}));
declare global {
    var connectionObj: Sequelize;
    var SQS_HELPER: typeof sqs_helper;
    var mongo_connection: typeof Mongoose | unknown
}
/** ALLOW CORS */
app.use(cors({
    origin : "*",
    optionsSuccessStatus : 200
}))

app.get('/v1/health', (_req: any, res: any) => {
    res.json({status : 'ok'})
})

import { app_route } from "./app_routing"

app.use("/v1", app_route)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`)
});
