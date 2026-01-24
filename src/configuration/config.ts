import * as seq from "sequelize"
import mongoose, { Mongoose } from "mongoose";

export class Connection {
    private dbName: string = "";
    private dbUserName: string = "";
    private dbPassword: string = "";
    private maxRetries = 5;
    private retryDelay = 5000;

    connectToPgDB() {
        const host = process.env.DB_HOST || 'localhost';
        const dialect = (process.env.DB_DIALECT as seq.Dialect) || 'postgres';
        const timezone = process.env.DB_TIMEZONE || '+00:00';
        
        let connectionConfigObj: seq.Options = {
            host,
            dialect,
            timezone,
            logging: process.env.NODE_ENV === 'production' ? false : console.log,
            define: {
                timestamps: false,
                freezeTableName: true,
            },
            pool: {
                max: 5,
                min: 0,
                idle: 5000
            }
        };

        this.dbName = process.env.DB_NAME || 'database';
        this.dbUserName = process.env.DB_USERNAME || 'user';
        this.dbPassword = process.env.DB_PASS || 'password';

        let conn = new seq.Sequelize(this.dbName, this.dbUserName, this.dbPassword, connectionConfigObj);
        return conn;
    }

    connect(): Mongoose {
        const dbName = process.env.DB_NAME || 'database';
        const mongoUri = `${process.env.MONGODB_URI || 'mongodb://localhost:27017/'}${dbName}`;
        
        mongoose.connect(mongoUri, {
            retryWrites: true,
            w: 'majority',
        }).then((res) => {
            console.log("Connected to MongoDB Database:", res.connection.host);
        }).catch((err: Error) => {
            console.error("Error connecting to MongoDB:", err.message);
        });

        // Set up connection event handlers
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connection established');
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB connection disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

        return mongoose;
    }
}

