'use strict'

export class MongoModel {
    private connection: any
    private schema: {}
    public MongoModel: any

    constructor(name: string, schema: {}, schemaOptions: any = {}) {
        this.connection = global.mongo_connection;
        this.schema = this.connection.Schema(schema, schemaOptions);
        this.connection.models = {};
        this.MongoModel = this.connection.model(name, this.schema);
    }

    addNewRecord(dataObj: object): Promise<object> {
        return this.MongoModel.create(dataObj)
    }
}