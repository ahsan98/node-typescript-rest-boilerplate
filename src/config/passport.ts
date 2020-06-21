import { PassportStatic } from "passport";
import passportLocal from "passport-local";
import passportJWT from "passport-jwt";
import { User, UserDocument } from "../models/User";
import { ActionRequired } from "../enums/actions-required.enum";

const LocalStrategy = passportLocal.Strategy;
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

const validateAccountStatus = (user: UserDocument, done: passportJWT.VerifiedCallback) => {

  if (!user.isVerified) {
    const data = { actionRequired: ActionRequired.EMAIL_VERIFICATION };
    return [false, done(null, false, { data, message: 'Account is not active' })];
  }

  return [true, done(null, user)];
}

export = (passport: PassportStatic) => {

  const jwtOpts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
  };

  passport.use(new JwtStrategy(jwtOpts, (jwt_payload, done) => {
    User.findById(jwt_payload.id)
      .then(async (user) => {
        if (!user) {
          return done(null, false, { message: 'Auth token is invalid' });
        } else {
          return validateAccountStatus(user, done);
        }
      })
      .catch((error) => { return done(error, false) });
  }));

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  }, (email, password, done) => {
    User.findOne({ email: email.toLowerCase() }, (err, user: any) => {
      if (err) { return done(err); }
      if (!user) {
        return done(undefined, false, { message: `Email ${email} not found.` });
      }
      user.comparePassword(password, (err: Error, isMatch: boolean) => {
        if (err) { return done(err); }
        if (isMatch) {
          return validateAccountStatus(user, done);
        }
        return done(undefined, false, { message: "Invalid email or password." });
      });
    });
  }));
}
