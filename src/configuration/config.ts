import * as seq from "sequelize"
import mongoose from "mongoose";

export class Connection {
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

    connect() {
        try {
            mongoose.connect(`${process.env.MONGODB_URI}${process.env.DB_NAME}`).then((res) => {
                
                mongoose.connection.useDb(process.env.DB_NAME || "");
                console.log("Connected to MongoDB Database", res.connection.host);
            }).catch((err: any) => console.log("Error from MongoDB", err));
            return mongoose;
        } catch (error: any) {
            console.log("Error connecting to MongoDB:", error.message)
        }
    }
}