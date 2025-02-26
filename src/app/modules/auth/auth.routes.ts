import express, { Router } from 'express';
import auth from '../../middlewares/auth';
import { ENUM_USER_ROLE } from '../../../enums/user';
import { uploadFile } from '../../middlewares/fileUploader';
import { AuthController } from './auth.controller';
import { MemberController } from '../member/member.controller';
import { ClientController } from '../client/client.controller';

const router = express.Router();
//------ Auth Route -----------------
router.post("/register", AuthController.registrationAccount)
router.post("/register-user", uploadFile(), AuthController.addClientAgents)
router.post("/login", AuthController.loginAccount)
// router.post("/activate-user", AuthController.activateAccount)
router.post("/resend", AuthController.resendActivationCode)
router.post("/active-resend", AuthController.resendCodeActivationAccount)
router.post("/forgot-password", AuthController.forgotPass)
router.post("/forgot-resend", AuthController.resendCodeForgotAccount)
router.post("/verify-otp", AuthController.checkIsValidForgetActivationCode)
router.post("/reset-password", AuthController.resetPassword)
router.patch("/change-password",
  auth(
    ENUM_USER_ROLE.CLIENT,
    ENUM_USER_ROLE.MEMBER,
    ENUM_USER_ROLE.AGENT,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN
  ), AuthController.changePassword
);
router.delete(
  "/delete-account",
  // auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  AuthController.deleteMyAccount
);

//------ Client/Agent Router ---------------
router.get("/client/profile", auth(ENUM_USER_ROLE.CLIENT, ENUM_USER_ROLE.AGENT), ClientController.getProfile)
router.patch(
  "/client/edit-profile",
  auth(ENUM_USER_ROLE.CLIENT, ENUM_USER_ROLE.AGENT),
  uploadFile(),
  ClientController.updateMyProfile
)

router.patch(
  "/client/edit-profile/userId/:userId/authId/:authId",
  auth(ENUM_USER_ROLE.CLIENT, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  ClientController.updateProfile
)
// //------ Admin Router ---------------
router.get(
  "/member/profile",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.SUPER_ADMIN),
  MemberController.myProfile
)
router.patch(
  "/member/edit-profile",
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  MemberController.updateMyProfile
);
router.patch(
  "/members/edit-profile/memberId/:userId/authId/:authId",
  auth(ENUM_USER_ROLE.MEMBER, ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.SUPER_ADMIN),
  uploadFile(),
  MemberController.updateProfile
);
// ========================
router.get(
  "/get-all-user",
  AuthController.getALLUsers
);



export const AuthRoutes = router;
