import passport from "passport";
import { ResponseHandler } from "../classes/ResponseHandler";
import { StatusCode } from "../enums/status-codes.enum";
import { Request, Response, NextFunction } from 'express';

export const jwtAuthenticator = async (req: Request, res: Response, next: NextFunction) => {
  return passport.authenticate('jwt', { session: false }, (err, data, info) => {
    if (err) {
      return next(err);
    }

    if (!data) {
      return ResponseHandler.makeResponse(res, StatusCode.UNAUTHORIZED, false, (info || {}).data, (info || {}).message);
    }

    req.user = data;
    return next();
  })(req, res, next);
};