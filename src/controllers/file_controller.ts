import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { Request, Response, NextFunction } from "express";
import { pipeline } from "stream/promises";
import { metricsEmitter } from "../Metrics/metricsEmitter";

export class FileController {
  constructor() {}

  private storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "src/uploads/");
    },
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + path.extname(file.originalname);
      cb(null, uniqueName);
    },
  });
  private upload = multer({
    storage: this.storage,
  }).single("file");
  /* private storage = multer.memoryStorage();
  private upload = multer({storage: this.storage}).single("file") */

  fileUploadController = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    this.upload(req, res, async (err: any) => {
      if (err) {
        metricsEmitter.emit("api_request_complete", {
          durationMs: Date.now() - startTime,
          succcess: false,
        });

        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        metricsEmitter.emit("api_request_complete", {
          durationMs: Date.now() - startTime,
          succcess: false,
        });

        return res.status(400).json({ message: "No file uploaded" });
      }

      try {
        const processImage = global.SQS_HELPER.sendToRabbitMQ({image_name: req.file.filename, startTime: startTime});
        console.log("processImage", processImage);
        metricsEmitter.emit("queue_publish_success");
        metricsEmitter.emit("api_request_complete", {
          durationMs: Date.now() - startTime,
          success: true
        });
        return res.status(200).json({
          message: "File uploaded and PDF processed successfully",
        });
      } catch (error: any) {
        metricsEmitter.emit("queue_publish_error");

        metricsEmitter.emit("api_request_complete", {
          durationMs: Date.now() - startTime,
          success: false,
        });
        return res.status(500).json({
          message: "Error processing PDF",
          error: error.message,
        });
      }
    });
  };

  resizeImage = async (image_path: string, image_name: string): Promise<boolean> => {
    try {
      // 1. Create the Sharp transformer (Duplex stream)
      const transformer = sharp()
        .resize(800, 600)
        .webp({ quality: 80 })
        .on('info', (info) => console.log("Image processed:", info));
  
      // 2. Set up source and destination paths
      const outputDir = path.dirname(image_path);
      const outputFileName = `${path.parse(image_name).name}.webp`;
      const outputPath = path.join(outputDir, outputFileName);
  
      // 3. Create file streams
      const input = fs.createReadStream(image_path);
      const output = fs.createWriteStream(outputPath);
  
      // 4. Execute the pipeline
      await pipeline(input, transformer, output);
      
      console.log(`Image processing successful: ${outputPath}`);
      return true;
    } catch (error: any) {
      console.error("Error in image resizing:", error.message);
      return false;
    }
  };
}
