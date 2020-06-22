import { Request, Response, NextFunction } from "express";
import { matchedData } from "express-validator";
import { User, UserDocument } from "../models/User";
import { Email } from "../classes/Email";
import { ResponseHandler } from "../classes/ResponseHandler";
import { StatusCode } from "../enums/status-codes.enum";
import passport from "passport";
import _ from "lodash";
import { userAuthParams } from "../allowed-params/user";
import { userParams } from "../allowed-params/user";
import moment from "moment";

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  const data = matchedData(req);

  const mappedData = {
    email: data.email.toLowerCase(),
    password: data.password,
    profile: {
      name: data.name,
      gender: data.gender
    }
  }

  User.create(mappedData).then((user) => {
    Email.sendVerificationCode(user).then(async (code: string) => {
      user.emailVerificationToken = code;
      await user.save();
    }).catch((error) => { });
    
    const resData = _.pick(user.toJSON(), userParams);
    return ResponseHandler.makeResponse(res, StatusCode.CREATED, true, resData, `Account created successfully. Please activate it using the code send at ${user.email}`);
  }).catch((error) => {
    return ResponseHandler.makeResponse(res, StatusCode.BAD_REQUEST, false, error);
  });
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('local', { session: false }, async (err, passportUser, info) => {
    if (err) {
      return next(err);
    }

    if (passportUser) {
      let resData = passportUser.toJSON();
      resData.token = passportUser.generateJWT();
      resData = _.pick(resData, userAuthParams);
      return ResponseHandler.makeResponse(res, StatusCode.OK, true, _.merge((info || {}).data, resData), "Logged in successfully");
    }

    return ResponseHandler.makeResponse(res, StatusCode.BAD_REQUEST, false, (info || {}).data, (info || {}).message);
  })(req, res, next);
};

export const resendActivationCode = async (req: Request, res: Response, next: NextFunction) => {
  const data = matchedData(req);

  User.findOne({ email: data.email.toLowerCase() }).then(async (user) => {
    if (!user) {
      return ResponseHandler.makeResponse(res, StatusCode.BAD_REQUEST, false, null, 'User not found');
    }
    if (user.isVerified) {
      return ResponseHandler.makeResponse(res, StatusCode.OK, true, null, "Account already verified!");
    }

    Email.sendVerificationCode(user).then(async (code: string) => {
      user.emailVerificationToken = code;
      await user.save();
      return ResponseHandler.makeResponse(res, StatusCode.OK, true, {}, `Activation code sent to ${user.email}!`);
    }).catch((error) => {
      return ResponseHandler.makeResponse(res, StatusCode.BAD_REQUEST, false, null, 'Unable to process request right now try again later!');
    });
  });
};

export const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
  const data = matchedData(req);

  User.findOne({ email: data.email.toLowerCase() }).then(async (user) => {
    if (!user) {
      return ResponseHandler.makeResponse(res, StatusCode.BAD_REQUEST, false, null, 'User not found');
    }
    if (user.isVerified) {
      return ResponseHandler.makeResponse(res, StatusCode.OK, true, null, "Account already verified!");
    }
    if (user.emailVerificationToken != data.code) {
      return ResponseHandler.makeResponse(res, StatusCode.BAD_REQUEST, false, null, "Invalid code");
    }
    user.isVerified = true;
    user.emailVerificationToken = null;
    await user.save();
    
    let resData = user.toJSON();
    resData.token = user.generateJWT();
    resData = _.pick(resData, userAuthParams);

    return ResponseHandler.makeResponse(res, StatusCode.OK, true, resData, "Account verified successfully!");
  });
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  const data = matchedData(req);

  const user = req.user as UserDocument;
  user.comparePassword(data.oldPassword, async (err, isMatch) => {
    if (err) {
      return ResponseHandler.makeResponse(res, StatusCode.BAD_REQUEST, false, err);
    }

    if (isMatch) {
      user.password = data.password;
      await user.save();
      return ResponseHandler.makeResponse(res, StatusCode.OK, true, null, "Password reset successfully!");
    }

    return ResponseHandler.makeResponse(res, StatusCode.OK, true, null, "Old password is incorrect");
  })
}

export const sendForgotPassCode = async (req: Request, res: Response, next: NextFunction) => {
  const data = matchedData(req);

  User.findOne({ email: data.email.toLowerCase() }).then(async (user) => {
    if (!user) {
      return ResponseHandler.makeResponse(res, StatusCode.BAD_REQUEST, false, null, 'User not found');
    }

    Email.sendPasswordResetCode(user).then(async (code: string) => {
      user.passwordResetToken = code;
      const expireTime = moment(new Date()).add('30', 'm').toDate();

      user.passwordResetExpires = expireTime;
      await user.save();
      return ResponseHandler.makeResponse(res, StatusCode.OK, true, null, `Reset code sent to email (${user.email}).`);
    }).catch((error) => {
      return ResponseHandler.makeResponse(res, StatusCode.BAD_REQUEST, false, null, 'Unable to process request right now try again later!');
    });
  });
}

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const data = matchedData(req);

  User.findOne({ email: data.email.toLowerCase() }).then(async (user) => {
    if (!user) {
      return ResponseHandler.makeResponse(res, StatusCode.BAD_REQUEST, false, null, 'User not found');
    }

    if (!user.passwordResetToken || !user.passwordResetExpires) {
      return ResponseHandler.makeResponse(res, StatusCode.BAD_REQUEST, false, null, "No code sent for reset");
    }

    const currentTime = new Date();
    if (currentTime > user.passwordResetExpires) {
      return ResponseHandler.makeResponse(res, StatusCode.BAD_REQUEST, false, null, "Code expired");
    }

    if (user.passwordResetToken != data.code) {
      return ResponseHandler.makeResponse(res, StatusCode.BAD_REQUEST, false, null, "Invalid code");
    }

    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    user.password = data.password;

    await user.save();
    return ResponseHandler.makeResponse(res, StatusCode.OK, true, null, "Your password has been reset successfully!");
  });
}