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

  // INITIALIZE LOG OBJECT
  initLog() {
    global.logs.logObj.file_name = "V1-DeeplinkService";
    global.logs.logObj.application = global.path.dirname(__filename) + global.path.basename(__filename);
}

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
    this.initLog()
    let apiname_with_trace_id: string = 'fileUploadController - ';
    // global.logs.writelog(apiname_with_trace_id, ['Request : ', req]);
    
    const startTime = Date.now();
    console.log("1111111")
    
    this.upload(req, res, async (err: any) => {
      console.log("1111111")
      if (err) {
        console.log("1111111")
        await metricsEmitter.emit("api_request_complete", {
          durationMs: Date.now() - startTime,
          succcess: false,
        });
    
        return res.status(400).json({ error: err.message });
      }
      console.log("1111111")
      if (!req.file) {
        await metricsEmitter.emit("api_request_complete", {
          durationMs: Date.now() - startTime,
          succcess: false,
        });
        console.log("1111111")
        return res.status(400).json({ message: "No file uploaded" });
      }
      console.log("1111111")
      try {
        console.log("1111111")
        const s3Response: any = await this.s3_helper.s3Upload( req.file.path, req.file.filename);
        global.logs.writelog(apiname_with_trace_id, ["s3Response: ", s3Response]);
        if (s3Response.error) {
          throw new Error("S3 upload failed");
        }
        console.log("1111111")
        const insert_obj: any = {
          image_id: randomUUID(),
          image_name: req.file?.filename as string,
          status: 'uploaded',
          added_timestamp: moment().format("YYYY-MM-DD HH:mm:ss")
        }
        console.log("1111111")
        const insert: any = await this._filesModel.addNewRecord(insert_obj);
        global.logs.writelog(apiname_with_trace_id, ["insert: ", insert]);
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
        console.log("error", error.stack)
        global.logs.writelog(apiname_with_trace_id, ["ERROR: ", error.stack]);
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
