import { S3helperClient, S3helperClientresponse, s3Parts } from "../common_interface";
import { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, CreateMultipartUploadCommand, AbortMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import * as fs from "fs"
import { AppConfig, configs } from "../app.config";

export class aws_helper {
    private client: S3helperClient;
    private _config: AppConfig;

    constructor(appConfig: AppConfig = configs) {
        this._config = appConfig;
        if (this._config.environment == "local" || this._config.environment == "test") {
            this.client = new S3Client({
                region: this._config.awsRegion as string,
                credentials: {
                    accessKeyId: this._config.awsAccessKey as string,
                    secretAccessKey: this._config.awsSecretAccessKey as string
                }
            });
        }
        else {
            this.client = new S3Client({
                region: this._config.awsRegion as string,
            });
        }
    }

    public s3Upload = async(localFilePath: string, filename: string) => {
        let that = this;
        return new Promise(function (resolve, reject) {
            const command = new PutObjectCommand({
                Bucket: that._config.s3Bucket,
                Key: filename,
                Body: fs.readFileSync(localFilePath),
            });
            that.client.send(command, (err: object, data: S3helperClientresponse) => {
                if (err) return resolve({error: true, message: "Unable to upload file in S3", errorStack: err});
                else {
                    fs.unlink(localFilePath, (err => {
                        if (err) console.error(err)
                    }));
                    return resolve({error: false, message: "File uploaded to S3 successfully",});
                }
            })
        })
    }

    public deleteFileFromS3 = async(filepath: string) => {
        let that = this;
        return new Promise(function (resolve, reject) {
            const command = new DeleteObjectCommand({
                Bucket: that._config.s3Bucket,
                Key: filepath
            });

            that.client.send(command, (err: object, data: S3helperClientresponse) => {
                if (err) {
                    return resolve({error: true, message: "Unable to upload file in S3", errorStack: err});
                }
                else {
                    return resolve({error:false, message:'File deleted successfully from S3.',data:data});
                }
            })
        })
    }
}