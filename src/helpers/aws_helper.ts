import { S3helperClient, S3helperClientresponse, s3Parts } from "../common_interface";
import { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, CreateMultipartUploadCommand, AbortMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from "@aws-sdk/client-s3";
import * as fs from "fs"

export class aws_helper {
    private client: S3helperClient;

    constructor() {
        if (process.env.NODE_env = "local") {
            this.client = new S3Client({
                region: process.env.AWS_DEFAULT_REGION as string,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY as string,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
                }
            });
        }
        else {
            this.client = new S3Client({
                region: process.env.AWS_DEFAULT_REGION as string,
            });
        }
    }

    public s3Upload = async(localFilePath: string, filename: string) => {
        let that = this;
        return new Promise(function (resolve, reject) {
            const command = new PutObjectCommand({
                Bucket: process.env.S3_BUCKET,
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
                Bucket: process.env.S3_BUCKET,
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