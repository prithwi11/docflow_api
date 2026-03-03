import { Router } from "express";
import { Connection } from "mongoose";
import { FileController } from "../controllers/file_controller";

export default function file_router(connection: Connection) {

    const router = Router();
    const fileController = new FileController(connection);

    router.post("/upload", fileController.fileUploadController);

    return router;
}