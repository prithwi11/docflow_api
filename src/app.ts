import express from "express"
import http from "http"
import cors from "cors"
import dotenv from "dotenv"
import { config } from "./configuration/config"
import { Sequelize } from "sequelize"
import { common_helper } from "./common_helper"
import { helperConfig } from "./helper_config"

let global_helper = new common_helper();

dotenv.config()
const app = express()
const server = http.createServer()
const PORT = process.env.PORT

declare global {
    var Helpers: typeof global_helper;
    var helper_config: typeof helperConfig;
    var connectionObj: Sequelize;
}

global.connectionObj = new config().connectToPgDB();

app.use(express.json({limit : '150mb'}));
app.use(express.urlencoded({limit : '150mb', extended : true}));

/** ALLOW CORS */
app.use(cors({
    origin : "*",
    optionsSuccessStatus : 200
}))

app.get('/v1/health', (_req: any, res: any) => {
    res.json({status : 'ok'})
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})