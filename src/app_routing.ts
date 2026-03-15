import { Router } from "express";
import { Connection } from "mongoose";
import file_router from "./routes/file_routes";

export function createAppRouter(connection: Connection) {

    const router = Router();

    router.use("/file", file_router(connection));

    return router;
}