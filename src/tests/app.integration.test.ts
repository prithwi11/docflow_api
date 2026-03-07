import { TestS3Config } from "./helpers/test.s3";
import { TestSQSHelper } from "./helpers/test.queue";
import { TestDatabase } from "./helpers/test.database";
import { TestFixtures } from "./helpers/test.fixtures";
import { FileModel } from "../Models/file_model";
import path from "path";
import dotenv from "dotenv"
dotenv.config()
import fs from "fs"
import { Connection } from "mongoose";
import request from "supertest"
import express from "express"
import { FileController } from "../controllers/file_controller";

describe("Test 1: End to end Image Upload", () => {
    let app: any;
    let connection: Connection;
    let filesModel: any;
    const test_db = new TestDatabase();
    const test_s3_setup = new TestS3Config();

    beforeAll(async() => {
        await test_s3_setup.createTestBucket();
        connection = await test_db.connect();
        const controller = new FileController(connection);
        
        global.logs = {
            logObj: {},
            writelog: jest.fn(),
        } as any;
        
        global.SQS_HELPER = {
            sendToRabbitMQ: jest.fn().mockResolvedValue(true),
        } as any;
        global.path = path as any;

        app = express();
        app.post("/v1/file/upload", await controller.fileUploadController);
        app.use((err: any, req: any, res: any, next: any) => {
            console.error("EXPRESS ERROR:", err);
            res.status(500).json({ error: err.message });
        });
    });

    afterEach(async() => {
        await test_db.dropDatabase();
    })

    afterAll(async() => {
        await test_db.close();
        await test_s3_setup.cleanTestBucket()
    });

    it("Should Upload Image to Test S3 Bucket", async() => {
        const start_time = Date.now();
        const test_fixtures: any = new TestFixtures();
        const image = await test_fixtures.createTestImage();
        expect(image).toBeDefined();
        let local_file_path = path.join(__dirname, 'uploads', image);

        if (image) {
            const response = await request(app).post("/v1/file/upload").attach("file", local_file_path);
            console.log("response", response.body, response.status)
            expect(response.status).toBe(200);
            
        }
    })
})