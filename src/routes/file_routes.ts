import { Router } from "express";
import { FileController } from "../controllers/file_controller";
import { CommonMiddleware } from "../common_middleware";

const router = Router();
const fileController = new FileController();
const common_middleware = new CommonMiddleware();
// File upload endpoint
let middleware = [
    common_middleware.trackRequest
]

router.route("/upload")
    .post(middleware, fileController.fileUploadController)
// router.post("/upload", fileController.fileUploadController);

export default router;

