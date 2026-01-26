import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { Request, Response, NextFunction } from "express";
import { pipeline } from "stream/promises";
import { metricsEmitter } from "../Metrics/metricsEmitter";
import { randomUUID } from "crypto";
import moment from "moment";
import { FileModel } from "../Models/file_model";
import { aws_helper } from "../helpers/aws_helper";

export class FileController {
  private _filesModel = new FileModel();
  private s3_helper = new aws_helper();
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

  fileUploadController = async(req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    this.upload(req, res, async (err: any) => {
      if (err) {
        await metricsEmitter.emit("api_request_complete", {
          durationMs: Date.now() - startTime,
          succcess: false,
        });
    
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        await metricsEmitter.emit("api_request_complete", {
          durationMs: Date.now() - startTime,
          succcess: false,
        });

        return res.status(400).json({ message: "No file uploaded" });
      }

      try {
        const s3Response: any = await this.s3_helper.s3Upload( req.file.path, req.file.filename);
        if (s3Response.error) {
          throw new Error("S3 upload failed");
        }
        const insert_obj: any = {
          image_id: randomUUID(),
          image_name: req.file?.filename as string,
          status: 'uploaded',
          added_timestamp: moment().format("YYYY-MM-DD HH:mm:ss")
        }
        const insert: any = await this._filesModel.addNewRecord(insert_obj)
        const processImage = await global.SQS_HELPER.sendToRabbitMQ({image_name: req.file.filename, startTime: startTime, image_id: insert_obj.image_id});
        metricsEmitter.emit("queue_publish_success");
        metricsEmitter.emit("api_request_complete", {
          durationMs: Date.now() - startTime,
          success: true
        });
        return res.status(200).json({
          message: "File uploaded and PDF processed successfully",
        });
      } catch (error: any) {
        await metricsEmitter.emit("queue_publish_error");

        await metricsEmitter.emit("api_request_complete", {
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
