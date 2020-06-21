import { Response as ExpressResponse } from 'express';

export type Response = {
  success: boolean;
  message: string;
  data?: any;
  errors?: any;
}

export class ResponseHandler {
  static makeResponse(res: ExpressResponse, statusCode: number, success: boolean, data: any, message = ''){
    const responseObject: Response = {
      success,
      message
    };
    if (success) {
      responseObject.data = data || null;
    } else {
      if (data) {
        responseObject.errors = ResponseHandler.parseErrors(data);
        responseObject.message = ResponseHandler.parseMessage(data) || message;
      }
    }
    return res.status(statusCode)
      .json(responseObject)
  }

  static parseErrors(data: any) {
    return data;
  }

  static parseMessage(data: any) {
    return data.errmsg || (data && data.errors ? (Object.values(data.errors)[0] as any).message : '');
  }
}