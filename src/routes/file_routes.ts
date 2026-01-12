import { Router } from "express";
import { FileController } from "../controllers/file_controller";
const file_router = Router();

const fileController = new FileController();

file_router.post("/upload", fileController.fileUploadController);

export default file_router