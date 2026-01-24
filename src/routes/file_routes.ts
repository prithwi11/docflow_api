import { Router } from "express";
import { FileController } from "../controllers/file_controller";

const router = Router();
const fileController = new FileController();

// File upload endpoint
router.post("/upload", fileController.fileUploadController);

export default router;

