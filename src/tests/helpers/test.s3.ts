import {
    DeleteObjectCommand,
    DeleteObjectsCommand,
    GetObjectCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
    CreateBucketCommand,
    CreateBucketCommandOutput
} from "@aws-sdk/client-s3";

import fs, { createWriteStream } from "fs";
import { pipeline } from "stream/promises";
import dotenv from "dotenv";
dotenv.config();

import { AppConfig, configs } from "../../app.config";

export class TestS3Config {
    private client: S3Client;
    private _config: AppConfig;

    constructor(appConfig: AppConfig = configs) {
        this._config = appConfig;

        this.client = new S3Client({
            region: this._config.awsRegion,
            credentials: {
                accessKeyId: this._config.awsAccessKey,
                secretAccessKey: this._config.awsSecretAccessKey
            }
        });
    }

    public async createTestBucket() {
        try {
            const command = new CreateBucketCommand({
                Bucket: this._config.s3Bucket,
            });

            await this.client.send(command);

            return { error: false, message: "Test Bucket created" };
        } catch (err) {
            return { error: true, message: "Unable to create test bucket", errorStack: err };
        }
    }

    public async uploadFileToS3(localFilePath: string, filename: string) {
        try {
            const command = new PutObjectCommand({
                Bucket: this._config.s3Bucket,
                Key: filename,
                Body: fs.readFileSync(localFilePath)
            });

            await this.client.send(command);

            fs.unlinkSync(localFilePath);

            return { error: false, message: "File uploaded to S3" };
        } catch (err) {
            return { error: true, message: "Unable to upload file in S3", errorStack: err };
        }
    }

    public async deleteFileFromS3(filepath: string) {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this._config.s3Bucket,
                Key: filepath
            });

            const data = await this.client.send(command);

            return { error: false, message: "File deleted successfully from S3.", data };
        } catch (err) {
            return { error: true, message: "Unable to delete file in S3", errorStack: err };
        }
    }

    public async cleanTestBucket() {
        let isTruncated = true;
        let continuationToken: string | undefined;

        while (isTruncated) {
            const listParams = {
                Bucket: this._config.s3Bucket,
                ContinuationToken: continuationToken
            };

            const listResponse = await this.client.send(
                new ListObjectsV2Command(listParams)
            );

            const { Contents, IsTruncated, NextContinuationToken } = listResponse;

            if (!Contents || Contents.length === 0) break;

            const deleteParams = {
                Bucket: this._config.s3Bucket,
                Delete: {
                    Objects: Contents.map((item: any) => ({ Key: item.Key })),
                    Quiet: true,
                },
            };

            await this.client.send(new DeleteObjectsCommand(deleteParams));

            console.log(`Deleted ${Contents.length} objects.`);

            isTruncated = !!IsTruncated;
            continuationToken = NextContinuationToken;
        }
    }

    public async verifyS3ObjectExists(file_name: string) {
        try {
            const command = new HeadObjectCommand({
                Bucket: this._config.s3Bucket,
                Key: file_name
            });

            await this.client.send(command);
            return true;

        } catch (err: any) {
            if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
                return false;
            }
            throw err;
        }
    }
}
