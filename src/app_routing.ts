import express from "express"
const app = express();

import file_router from "./routes/file_routes";


app.use('/file', file_router)
export const app_route = app;
