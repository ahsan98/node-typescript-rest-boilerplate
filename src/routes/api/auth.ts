import express from "express";
import { registerValidator, loginValidator, emailValidator, activationValidator } from "../../validators/auth.validator";
import { runValidation } from "../../helpers/validation";
import { registerUser, loginUser, resendActivationCode, verifyUser } from "../../controllers/auth";

const router = express.Router();

router.post('/register',
  registerValidator,
  runValidation,
  registerUser
);

router.post('/login',
  loginValidator,
  runValidation,
  loginUser
);

router.post('/resend/activation-code',
  emailValidator,
  runValidation,
  resendActivationCode
);

router.post('/verify',
  activationValidator,
  runValidation,
  verifyUser
);

export = router;