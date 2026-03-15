import { Router } from "express";
import { Connection } from "mongoose";
import { FileController } from "../controllers/file_controller";

export default function file_router(connection: Connection) {

    const router = Router();
    const fileController = new FileController(connection);

    // router.post("/upload", fileController.fileUploadController);
    router.post('/get-presigned-url', fileController.generateUploadUrl)
    router.post('/confirm-upload', fileController.confirmUpload)

    return router;
}