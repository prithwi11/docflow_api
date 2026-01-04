import express from "express"
import http from "http"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config()
const app = express()
const server = http.createServer()
const PORT = process.env.PORT

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