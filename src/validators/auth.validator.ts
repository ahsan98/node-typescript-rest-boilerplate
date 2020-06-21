import { RequestHandler } from "express";
import { check } from 'express-validator';
import { Genders } from "../enums/genders.enum";
import { enumToArray } from "../helpers/enums";

export const emailValidator: Array<RequestHandler> = [
  check('email')
    .not().isEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email is not valid'),
];

export const loginValidator: Array<RequestHandler> = emailValidator.concat([
  check('password')
    .not().isEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must have minimum 6 chracters'),
]);

export const registerValidator: Array<RequestHandler> = loginValidator.concat([
  check('name')
    .not().isEmpty().withMessage('Name is required'),

  check('gender')
    .not().isEmpty().withMessage('Gender is required')
    .isIn(enumToArray(Genders)).withMessage('Invalid gender')
]);

export const activationValidator = emailValidator.concat([
  check('code')
    .not().isEmpty().withMessage('Verification code is required')
    .isLength({ min: 6 }).withMessage('Invalid code'),
]);