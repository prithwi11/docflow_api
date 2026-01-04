export interface response_object_detail{
    data : object,
    status : {
        action_status : boolean,
        msg : string
    },
}

export interface statusBuild{
    status(value2 : number) : object,
    send(value1 : object) : object
}

export interface methodNotAllowed{
    setHeader(value1 : string,value2 : string) : object,
    send(value3 : object) : object,
    status(value4 : number) : object,  
}

export interface ICheckUnique {
    model: any,
    column_name: string,
    value: string,
    exclude_id?: number
}