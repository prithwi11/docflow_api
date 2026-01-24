import { Router } from "express";
import file_router from "./routes/file_routes";

const router = Router();

// Mount file routes at /file path
router.use("/file", file_router);

export { router as app_route };

