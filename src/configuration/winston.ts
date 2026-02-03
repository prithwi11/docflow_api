import appRoot from 'app-root-path';
import winston from'winston';
import requestIp from 'request-ip';
import moment, { Moment } from "moment-timezone";
import dotenv, { config } from "dotenv"
dotenv.config()
import {
    IlogObjForWinston,
    Ilogger_settingsForWinston,
    IloggerForWinston,
    IoptionsForWinston
} from "../common_interface";

export class winstonlog{
    private _logger_settings : Ilogger_settingsForWinston
    public logObj : IlogObjForWinston
    private _fileDate? : string;
    private _options : IoptionsForWinston
    public logger : IloggerForWinston | any;
      
    constructor(logger_settings : Ilogger_settingsForWinston) {
        this._logger_settings = logger_settings;
        this.logObj = {
            application : "",
            file_name : "",
            trace_id : '1',
            severity : 'INFO',
            message : "",
            method_name : ""
        };
        this._fileDate = this.getCurrentISTDate();

        this._options = {
            file : {},
            console : {}
        };

        this.logger = {
            stream : {},
            format : {},
            error: (createMessage : string) => {},
            warn: (createMessage : string) => {},
            info: (createMessage : string) => {},
            http: (createMessage : string) => {},
        }
    }

    public initiateLoggingSystem() {
        this._fileDate = this.getCurrentISTDate();
        const filepath = process.env.LOG_PATH;
        this._options = {
            file: {
              level: 'info',
              filename: `${filepath}${this._fileDate}-file.log`,
              handleExceptions: true,
              json: true,
              maxsize: 5242880, // 5MB
              colorize: false,
            },
            console: {
              level: 'debug',
              handleExceptions: true,
              json: true,
              colorize: true,
            },
        };
        if(process.env.SHOW_CONSOLE_LOG == '1') {
        this.logger = winston.createLogger({
            transports: [
              new winston.transports.Console(this._options.console),  
              new winston.transports.File(this._options.file)
            ],
            exitOnError: false, // do not exit on handled exceptions,
        });
        }else{
            this.logger = winston.createLogger({
                transports: [
                new winston.transports.File(this._options.file)
                ],
                exitOnError: false, // do not exit on handled exceptions,
            });
        }
        let logger_error_write = this._logger_settings.logger_error_write_all;
        let logger_generate_level = this._logger_settings.logger_generate_level
        
        this.logger.stream = {
            write: function(message : string, encoding : string) {
                if(logger_error_write && (logger_generate_level==1 || logger_generate_level ==2)){
                    this.logger.info(message);
                }
            },
        };
    }

    public writelog(method_name : string,msg : object, severity = ''){
        
        if(severity != '') {
            this.logObj.severity = severity;
        } else {
            this.logObj.severity = 'INFO';
        }
        this.logObj.method_name = method_name;
        let jsonMsg = JSON.stringify(msg);
        this.logObj.message = jsonMsg;
        
        if(this.logObj.method_name == '') {
            throw new Error('Method name is required to write log.');
        }

        if(this.logObj.application == '') {
            throw new Error('Application name is required to write log.');
        }

        if(this.logObj.file_name == '') {
            throw new Error('File name is required to write log.');
        }

        if(this.logObj.message == '') {
            throw new Error('Message is required to write log.');
        }

        let createLogFlag = false;
        if(this._logger_settings.logger_enable_write) {
            if(this._logger_settings.logger_enable_application_name != '') { //IF WANT TO GENERATE LOG FOR PARTICULAR APPLICATION
                if(this.logObj.application == this._logger_settings.logger_enable_application_name) {
                    createLogFlag = true;
                } else {
                    createLogFlag = false;
                }
            } else {
            createLogFlag = true;
            }
            if(createLogFlag){
            if(this._logger_settings.logger_enable_module_name != '') { //IF WANT TO GENERATE LOG FOR PARTICULAR MODULE OF AN APPLICATION
                if(this.logObj.file_name + '.' + this.logObj.method_name == this._logger_settings.logger_enable_module_name) {
                createLogFlag = true;
                } else {
                createLogFlag = false;
                }
            } else {
                createLogFlag = true;
            }
            }
            if(createLogFlag) {
                let createMessage = '~# '+this.getCurrentISTDateTime();
            
                let clientIp : string|null = '0:0:0:0';
                
                if(typeof(this.logObj.request) != 'undefined') {
                    if (Object.keys(this.logObj.request).length > 0) {
                    if(this.logObj.request) {
                        clientIp = requestIp.getClientIp(this.logObj.request);
                    }
                    }
                }
            
                let trace_id = '1';
                if(typeof(this.logObj.trace_id) != 'undefined') {
                    if(this.logObj.trace_id) {
                    trace_id = this.logObj.trace_id;
                    }
                }
            
                createMessage = createMessage+' | '+ this.logObj.application + ' | ' + this.logObj.file_name + '.' + this.logObj.method_name + ' | ' + trace_id + ' | ' + this.logObj.severity + ' | ' + clientIp + ' | ' + this.logObj.message;
                
                if(this.logObj.severity == 'ERROR') {
                    if(this._logger_settings.logger_generate_level == 1 || this._logger_settings.logger_generate_level == 2) {
                    this.logger.error(createMessage);
                    }
                } else if(this.logObj.severity == 'WARN') {
                    this.logger.warn(createMessage);
                } else if(this.logObj.severity == 'INFO') {
                    if(this._logger_settings.logger_generate_level == 2) {
                        this.logger.info(createMessage);
                    }
                } else if(this.logObj.severity == 'SQL') {
                    if(this._logger_settings.generate_sql_query_log) {
                    if(this._logger_settings.logger_generate_level == 2) {
                        this.logger.info(createMessage);
                    }
                    }
                }
            }
        }
    }

    private getCurrentISTDate(): string {
		let utc = Date.now() / 1000;
		return moment.unix(utc).tz(process.env.TZ as string).format('YYYY-MM-DD');
	}

    private getCurrentISTDateTime(): string {
		const date = new Date();
		let mons = date.toLocaleString('default', { month: 'short' });
		const str_date: string = mons + " " + date.getDate() + " " + ("0" + date.getHours()).slice(-2) + ":" + ("0" + date.getMinutes()).slice(-2) + ":" + ("0" + date.getSeconds()).slice(-2);
		return str_date;
	}
}