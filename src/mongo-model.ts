'use strict'

import { Connection, Schema } from "mongoose";

export class MongoModel {

    protected MongoModel: any;

    constructor(
        name: string,
        schemaDefinition: {},
        connection: Connection,
        schemaOptions: any = {}
    ) {

        const schema = new Schema(schemaDefinition, schemaOptions);

        // Prevent OverwriteModelError
        this.MongoModel =
            connection.models[name] ||
            connection.model(name, schema);
    }

    addNewRecord(dataObj: object): Promise<object> {
        return this.MongoModel.create(dataObj);
    }
}