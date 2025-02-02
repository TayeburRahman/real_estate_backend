import express, { Router } from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { uploadFile } from '../../middlewares/fileUploader';
import { AdminController } from '../admin/admin.controller';
import { AuthController } from './auth.controller';
import { PartnerController } from '../partner/partner.controller';
import { UserController } from '../user/user.controller';

const router = express.Router();
//------ Auth Route -----------------
router.post("/register", AuthController.registrationAccount)
router.post("/login", AuthController.loginAccount)
router.post("/activate-user", AuthController.activateAccount)
router.post("/resend", AuthController.resendActivationCode)
router.post("/active-resend", AuthController.resendCodeActivationAccount)
router.post("/forgot-password", AuthController.forgotPass)
router.post("/forgot-resend", AuthController.resendCodeForgotAccount)
router.post("/verify-otp", AuthController.checkIsValidForgetActivationCode)
router.post("/reset-password", AuthController.resetPassword)
router.patch("/change-password",
  auth(
    ENUM_USER_ROLE.USER,
    // ENUM_USER_ROLE.PARTNER,
    ENUM_USER_ROLE.SUPER_ADMIN
  ), AuthController.changePassword
);

//------ User Router ---------------
router.get("/profile", auth(ENUM_USER_ROLE.USER), UserController.getProfile)
router.patch(
  "/edit-profile",
  auth(ENUM_USER_ROLE.USER),
  uploadFile(),
  PartnerController.updateProfile
)
router.delete(
  "/delete-account",
  auth(ENUM_USER_ROLE.USER),
  PartnerController.deleteMyAccount
);

//------ Admin Router ---------------
router.get(
  "/profile",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.myProfile
)
router.patch(
  "/edit-profile",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  AdminController.updateProfile
)
router.delete(
  "/delete_account",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AdminController.deleteMyAccount
);

//------ Partner Route -----------------
router.get("/profile", auth(ENUM_USER_ROLE.PARTNER), PartnerController.getProfile)
router.patch(
  "/edit-profile",
  auth(ENUM_USER_ROLE.PARTNER),
  uploadFile(),
  PartnerController.updateProfile
)
router.delete(
  "/delete-account",
  auth(ENUM_USER_ROLE.PARTNER),
  PartnerController.deleteMyAccount
);



export const AuthRoutes = router;
