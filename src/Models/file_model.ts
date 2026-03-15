'use strict'

import { Connection } from "mongoose";
import { MongoModel } from "../mongo-model";

export class FileModel extends MongoModel {

    constructor(connection: Connection) {
        super(
            "file_details",
            {
                image_id: { type: String, required: true },
                image_name: { type: String, required: true },
                image_resized_name: { type: String },
                status: { type: String, required: true },
                added_timestamp: { type: Date, required: true },
                updated_timestamp: { type: Date }
            },
            connection
        );
    }
}