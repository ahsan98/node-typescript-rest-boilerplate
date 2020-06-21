import bcrypt from "bcrypt-nodejs";
import mongoose from "mongoose";
import { Genders } from "../enums/genders.enum";
import { enumToArray } from "../helpers/enums";
import jwt from 'jsonwebtoken';

export type UserDocument = mongoose.Document & {
  email: string;
  password: string;
  passwordResetToken: string;
  passwordResetExpires: Date;
  emailVerificationToken: string,
  isVerified: boolean,

  profile: {
    name: string;
    gender: string;
    location: string;
    website: string;
    picture: string;
  };

  comparePassword: comparePasswordFunction;
  generateJWT: generateJWTFunction
};

type comparePasswordFunction = (candidatePassword: string, cb: (err: any, isMatch: any) => {}) => void;
type generateJWTFunction = () => string;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date
  },
  emailVerificationToken: {
    type: String
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },

  profile: {
    name: {
      type: String,
      required: true
    },
    gender: {
      type: String,
      required: true,
      enum: enumToArray(Genders)
    },
  }
}, { timestamps: true });

/**
 * Password hash middleware.
 */
userSchema.pre("save", function save(next) {
  const user = this as UserDocument;
  if (user.isModified("password")) { 
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
  }
  next()
});

const comparePassword: comparePasswordFunction = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err: mongoose.Error, isMatch: boolean) => {
    cb(err, isMatch);
  });
};

const generateJWT: generateJWTFunction = function() {
  return jwt.sign({
    id: this._id,
  }, process.env.JWT_SECRET, { expiresIn: '30 days' })
}

userSchema.methods.comparePassword = comparePassword;
userSchema.methods.generateJWT = generateJWT;

export const User = mongoose.model<UserDocument>("User", userSchema);
