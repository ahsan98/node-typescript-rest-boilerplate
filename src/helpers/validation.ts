import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ResponseHandler } from '../classes/ResponseHandler';
import { StatusCode } from '../enums/status-codes.enum';

export const runValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ResponseHandler.makeResponse(res, StatusCode.BAD_REQUEST, false, errors.mapped(), 'Invalid params');
  }
  next();
};