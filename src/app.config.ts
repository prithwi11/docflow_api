import dotenv from "dotenv"
dotenv.config()

export interface AppConfig {
    s3Bucket: string;
    dbName: string;
    queueName: string;
    environment: string;
    mongoUri: string;
    rabbitmqHost: string;
    awsAccessKey: string;
    awsSecretAccessKey: string;
    awsRegion: string;
    logPath: string;
    timezone: string;
    showLog: string;
}

function load_config(): AppConfig {
    const env: string = process.env.NODE_ENV as string;
    const base_config = {
        s3Bucket: process.env.S3_BUCKET as string,
        dbName: process.env.DB_NAME as string,
        queueName: process.env.QUEUE_NAME as string,
        mongoUri: process.env.MONGODB_URI as string,
        rabbitmqHost: process.env.RABBITMQ_HOST as string,
        awsAccessKey: process.env.AWS_ACCESS_KEY as string,
        awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        awsRegion: process.env.AWS_DEFAULT_REGION as string,
        logPath: process.env.LOG_PATH as string,
        timezone: process.env.TZ as string,
        showLog: process.env.SHOW_CONSOLE_LOG as string,
    }
    const configs: Record<string, AppConfig> = {
        production: {
            ...base_config,
            environment: 'production' 
        },
        staging: {
            ...base_config,
            environment: 'staging'
        },
        development: {
            ...base_config,
            environment: 'development'
        },
        test: {
            ...base_config,
            dbName: 'docflow-test',
            queueName: 'file-processor-test',
            s3Bucket: 'docflow-test-bucket',
            environment: 'test'
        }
    }
    const config = configs[env];
    if (!config) {
        throw new Error(`Configuration for ${env} not found`)
    }
    return config;
}

export const configs = load_config();