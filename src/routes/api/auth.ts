import express from "express";
import { registerValidator, loginValidator, emailValidator, activationValidator, changePasswordValidator, passwordValidator, resetPasswordValidator } from "../../validators/auth.validator";
import { runValidation } from "../../helpers/validation";
import { registerUser, loginUser, resendActivationCode, verifyUser, changePassword, sendForgotPassCode, resetPassword } from "../../controllers/auth";
import { jwtAuthenticator } from "../../helpers/authenticators";

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

router.post('/change-password',
  jwtAuthenticator,
  changePasswordValidator,
  runValidation,
  changePassword
)

router.post('/forgot-password',
  emailValidator,
  runValidation,
  sendForgotPassCode
);

router.post('/forgot-password/resend/code',
  emailValidator,
  runValidation,
  sendForgotPassCode
);

router.post('/reset-password',
  resetPasswordValidator,
  runValidation,
  resetPassword
);

export = router;