import express from "express"
import http from "http"
import cors from "cors"
import dotenv from "dotenv"
import { config } from "./configuration/config"
import { Sequelize } from "sequelize"
import { app_route } from "./app_routing"
import { SqsHelper } from "./helpers/sqs_helper"
dotenv.config()
const app = express()
const server = http.createServer()
const PORT = process.env.PORT

declare global {
    var connectionObj: Sequelize;
    var SQS_HELPER: typeof sqs_helper;
}

const sqs_helper = new SqsHelper();
global.SQS_HELPER = sqs_helper;

global.connectionObj = new config().connectToPgDB();

// app.use(express.json({limit : '150mb'}));
// app.use(express.urlencoded({limit : '150mb', extended : true}));

/** ALLOW CORS */
app.use(cors({
    origin : "*",
    optionsSuccessStatus : 200
}))

app.get('/v1/health', (_req: any, res: any) => {
    res.json({status : 'ok'})
})

app.use("/v1", app_route)

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})