export interface IlogObjForWinston{
    application? : string,
    file_name? : string,
    trace_id? : string,
    severity? : string,
    message? : string,
    method_name? : string,
    request? : {
        headers : any
    }
}

export interface Ilogger_settingsForWinston{
    logger_generate_level? : any,
    logger_enable_write? : boolean, 
    logger_error_write_all? : boolean,
    generate_sql_query_log? : boolean,
    logger_enable_application_name? : string,
    logger_enable_module_name? : string
}

export interface IloggerForWinston{
    stream? : {},
    format? : {},
    error: (createMessage: string) => any,
    warn: (createMessage: string) => any,
    info: (createMessage: string) => any
}

export interface IoptionsForWinston{
    file? : fileForWinston,
    console? : optiinsForWinston
}

export interface fileForWinston{
    level?: string,
    filename?: string,
    handleExceptions?: boolean,
    json?: boolean,
    maxsize?: number,
    colorize?: boolean,
}

export interface optiinsForWinston{
    level?: string,
    handleExceptions?: boolean,
    json?: boolean,
    colorize?: boolean,
}

export interface S3helperClient{
    add?: Function[],
    addRelativeTo?: [],
    clone?: [],
    use?: [],
    remove?: [],
    removeByTag?: [],
    concat?: [],
    applyToStack?: [],
    identify?: [],
    resolve?: [],
    config:S3helperClientconfig
	send: (object: any,err:object) => any,
}

export interface S3helperClientconfig{
    apiVersion: string,
    base64Decoder: Function,
    base64Encoder: Function,
    disableHostPrefix: boolean,
    endpointProvider: Function,
    logger: {},
    serviceId: string,
    signerConstructor?: Function,
    signingEscapePath: boolean,
    urlParser: Function,
    useArnRegion: any,
    utf8Decoder: Function,
    utf8Encoder: Function,
    region: Function,
    credentials: Function,
    runtime: string,
    defaultsMode: any,
    bodyLengthChecker: Function,
    credentialDefaultProvider: Function,
    defaultUserAgentProvider: Function,
    eventStreamSerdeProvider: Function,
    getAwsChunkedEncodingStream: Function,
    maxAttempts: Function,
    md5: Function,
    requestHandler:  {},
    retryMode: any,
    sdkStreamMixin: Function,
    sha1: Function,
    sha256: Function,
    streamCollector: Function,
    streamHasher: Function,
    useDualstackEndpoint: Function,
    useFipsEndpoint: Function,
    useAccelerateEndpoint: boolean,
    useGlobalEndpoint?: any,
    disableMultiregionAccessPoints: boolean,
    defaultSigningName: string,
    endpoint?: any,
    tls: boolean,
    isCustomEndpoint?: boolean | undefined,
    retryStrategy?: any,
    systemClockOffset: number,
    signer: any,
    forcePathStyle: any,
    customUserAgent?: any,
    eventStreamMarshaller: {}
}

export interface S3helperClientresponse{
    error: boolean,
    message: string,
    data: string,
    MessageId : string,
    Messages : object
  
}

export interface s3Parts {
    PartNumber: number,
    ETag: string
}