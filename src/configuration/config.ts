import * as seq from "sequelize"
import mongoose from "mongoose";

export class config {
    private dbName: string = "";
    private dbUserName: string = "";
    private dbPassword: string = "";

    connectToPgDB() {
        let connectionConfigObj : object = {
            host: process.env.DB_HOST,
            dialect: process.env.DB_DIALECT,
            timezone: process.env.DB_TIMEZONE,
            logging: process.env.NODE_ENV === 'production' ? false : console.log,
            define: {
                timestamps: false,
                freezeTableName: true,
            },
            pool : {
                max: 5,
                min : 0,
                idle: 5000
            }
        };

        this.dbName = process.env.DB_NAME as string;
        this.dbUserName = process.env.DB_USERNAME as string;
        this.dbPassword = process.env.DB_PASS as string;

        let conn = new seq.Sequelize(this.dbName, this.dbUserName, this.dbPassword, connectionConfigObj);
        return conn;
    }

    connectToMongo = async() => {
        const mongo_uri: string = process.env.MONGODB_URI as string;
        const mongodb_name: string = process.env.MONGODB_NAME as string;
        const mongo_con = mongo_uri + mongodb_name;

        try {
            await mongoose.connect(mongo_con, {
                dbName : mongodb_name
            });
            console.log("connected to mongo")
        }
        catch (error: any) {
            console.log("MongoDB connection error", error);
            process.exit(1)
        }
    }
}