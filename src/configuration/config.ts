import * as seq from "sequelize"

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
}