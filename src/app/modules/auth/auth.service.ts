import bcrypt from "bcrypt";
import cron from "node-cron";
import httpStatus from "http-status";

import ApiError from "../../../errors/ApiError";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import { logger } from "../../../shared/logger";
import Auth from "./auth.model";

import sendEmail from "../../../utils/sendEmail";
import { ENUM_USER_ROLE } from "../../../enums/user";
import { sendResetEmail } from "./sendResetMails";
import { createActivationToken } from "../../../utils/createActivationToken";
import { resetEmailTemplate } from "../../../mails/reset.email";
import { ActivationPayload, IAuth, LoginPayload } from "./auth.interface";
import config from "../../../config";
import Client from "../client/client.model";
import Member from "../member/member.model";
import { Types } from "mongoose";
import { Multer } from "multer";


interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const registrationAccount = async (payload: IAuth) => {
  const { role, password, confirmPassword, email, ...other } = payload;

  if (!role || !Object.values(ENUM_USER_ROLE).includes(role as any)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Valid role is required!");
  }
  if (!password || !confirmPassword || !email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email, Password, and Confirm Password are required!");
  }
  if (password !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password and Confirm Password didn't match");
  }

  const existingAuth = await Auth.findOne({ email }).lean();

  if (existingAuth?.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
  }

  if (role === ENUM_USER_ROLE.AGENT && !other.clientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Client ID is required for Agent role!");
  }

  // If the account exists but is not active, delete previous entries
  if (existingAuth && !existingAuth.isActive) {
    await Promise.all([
      (existingAuth.role === "CLIENT" || existingAuth.role === "AGENT") &&
      Client.deleteOne({ authId: existingAuth._id }),
      (existingAuth.role === "ADMIN" || existingAuth.role === "MEMBER" || existingAuth.role === "SUPER_ADMIN") &&
      Member.deleteOne({ authId: existingAuth._id }),
      Auth.deleteOne({ email }),
    ]);
  }

  const { activationCode } = createActivationToken();
  const auth = {
    role,
    name: other.name,
    email,
    activationCode,
    password,
    expirationTime: Date.now() + 3 * 60 * 1000,
    isActive: true,
    phone_number: other.phone_number,
    address: other.address
  };

  const createAuth = (await Auth.create(auth)) as IAuth;

  if (!createAuth) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create auth account");
  }

  other.authId = createAuth._id;
  other.email = email;
  other.role = role;
  // Role-based user creation
  let result;
  if (role === ENUM_USER_ROLE.CLIENT || role === ENUM_USER_ROLE.AGENT) {
    result = await Client.create(other);
  } else if (
    role === ENUM_USER_ROLE.ADMIN ||
    role === ENUM_USER_ROLE.SUPER_ADMIN ||
    role === ENUM_USER_ROLE.MEMBER
  ) {
    result = await Member.create(other);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid role provided!");
  }

  return { result, role, message: "Account created successfully!" };
};

const registrationUser = async (files: any, payload: IAuth) => {
  const { role, password, confirmPassword, email, ...other } = payload;

  if (!role || !Object.values(ENUM_USER_ROLE).includes(role as any)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Valid role is required!");
  }
  if (!password || !confirmPassword || !email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email, Password, and Confirm Password are required!");
  }
  if (password !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password and Confirm Password didn't match");
  }

  const existingAuth = await Auth.findOne({ email }).lean();

  if (existingAuth?.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already exists");
  }
  if (role === ENUM_USER_ROLE.AGENT && !other.clientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Client ID is required for Agent role!");
  }

  // If the account exists but is not active, delete previous entries
  if (existingAuth && !existingAuth.isActive) {
    await Promise.all([
      (existingAuth.role === "CLIENT" || existingAuth.role === "AGENT") &&
      Client.deleteOne({ authId: existingAuth._id }),
      (existingAuth.role === "ADMIN" || existingAuth.role === "MEMBER" || existingAuth.role === "SUPER_ADMIN") &&
      Member.deleteOne({ authId: existingAuth._id }),
      Auth.deleteOne({ email }),
    ]);
  }

  if (files) {
    if (files.profile_image && files.profile_image[0]) {
      other.profile_image = `/images/profile/${files.profile_image[0].filename}`;
    }
  }

  const { activationCode } = createActivationToken();
  const auth = {
    role,
    name: other.name,
    email,
    activationCode,
    password,
    expirationTime: Date.now() + 3 * 60 * 1000,
    isActive: true,
    phone_number: other.phone_number,
    address: other.address,
    profile_image: other.profile_image
  };

  const createAuth = (await Auth.create(auth)) as IAuth;

  if (!createAuth) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to create auth account");
  }

  other.authId = createAuth._id;
  other.email = email;
  other.role = role;

  // Role-based user creation
  let result;
  if (role === ENUM_USER_ROLE.CLIENT || role === ENUM_USER_ROLE.AGENT) {
    if (role === ENUM_USER_ROLE.CLIENT) {
      other.place_an_order = true
      other.can_see_all_order = true;
      other.can_see_invoice = true;
      other.can_see_assigned_order = true;
      other.can_see_pricing = true;
      other.can_add_new_agent = true;
    }
    result = await Client.create(other);
  } else if (
    role === ENUM_USER_ROLE.ADMIN ||
    role === ENUM_USER_ROLE.SUPER_ADMIN ||
    role === ENUM_USER_ROLE.MEMBER
  ) {
    result = await Member.create(other);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid role provided!");
  }

  console.log('result', result)

  return { result, role, message: "Account created successfully!" };
};

// const activateAccount = async (payload: ActivationPayload) => {
//   const { activation_code, userEmail } = payload;

//   const existAuth = await Auth.findOne({ email: userEmail });
//   if (!existAuth) {
//     throw new ApiError(400, "User not found");
//   }
//   if (existAuth.activationCode !== activation_code) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Code didn't match!");
//   }
//   const user = await Auth.findOneAndUpdate(
//     { email: userEmail },
//     { isActive: true },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );

//   let result = {} as any;

//   if (existAuth.role === ENUM_USER_ROLE.USER) {
//     result = await User.findOne({ authId: existAuth._id });
//   } else if (
//     existAuth.role === ENUM_USER_ROLE.ADMIN ||
//     existAuth.role === ENUM_USER_ROLE.SUPER_ADMIN
//   ) {
//     result = await Admin.findOne({ authId: existAuth._id });
//   } else if (existAuth.role === ENUM_USER_ROLE.PARTNER) {
//     result = await Partner.findOne({ authId: existAuth._id });
//   } else {
//     throw new ApiError(400, "Invalid role provided!");
//   }

//   const accessToken = jwtHelpers.createToken(
//     {
//       authId: existAuth._id,
//       role: existAuth.role,
//       userId: result._id,
//     },
//     config.jwt.secret as string,
//     config.jwt.expires_in as string
//   );
//   const refreshToken = jwtHelpers.createToken(
//     { authId: existAuth._id, userId: result._id, role: existAuth.role },
//     config.jwt.refresh_secret as string,
//     config.jwt.refresh_expires_in as string
//   );

//   return {
//     accessToken,
//     refreshToken,
//     user,
//   };
// };

const loginAccount = async (payload: LoginPayload) => {
  const { email, password } = payload;

  const isAuth = await Auth.isAuthExist(email);

  if (!isAuth) {
    throw new ApiError(404, "User does not exist");
  }
  if (!isAuth.isActive) {
    throw new ApiError(401, "Please activate your account before logging in");
  }
  if (isAuth.is_block) {
    throw new ApiError(403, "You are blocked. Please contact support");
  }
  if (isAuth.password && !(await Auth.isPasswordMatched(password, isAuth.password))) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { _id: authId } = isAuth;
  let userDetails: any = null;
  let role = isAuth.role;

  switch (role) {
    case ENUM_USER_ROLE.AGENT:
    case ENUM_USER_ROLE.CLIENT:
      userDetails = await Client.findOne({ authId }).populate("authId");
      break;
    case ENUM_USER_ROLE.ADMIN:
    case ENUM_USER_ROLE.SUPER_ADMIN:
    case ENUM_USER_ROLE.MEMBER:
      userDetails = await Member.findOne({ authId }).populate("authId");
      break;
    default:
      throw new ApiError(400, "Invalid role provided!");
  }

  if (!userDetails) {
    throw new ApiError(404, "User details not found");
  }

  const accessToken = jwtHelpers.createToken(
    { authId, role, userId: userDetails._id },
    config.jwt.secret as string,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    { authId, role, userId: userDetails._id },
    config.jwt.refresh_secret as string,
    config.jwt.refresh_expires_in as string
  );

  return {
    id: authId,
    conversationId: isAuth.conversationId,
    isPaid: isAuth.isPaid,
    accessToken,
    refreshToken,
    user: userDetails,
  };
};

const forgotPass = async (payload: { email: string }) => {
  const user = await Auth.findOne(
    { email: payload.email },
    { _id: 1, role: 1, email: 1, name: 1 }
  ) as IAuth;

  if (!user?.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not found!");
  }

  const verifyCode = createActivationToken().activationCode;
  const verifyExpire = new Date(Date.now() + 15 * 60 * 1000);
  user.verifyCode = verifyCode;
  user.verifyExpire = verifyExpire;

  await user.save();

  const data = {
    name: user.name,
    verifyCode,
    verifyExpire: Math.round((verifyExpire.getTime() - Date.now()) / (60 * 1000)),
  };

  try {
    await sendEmail({
      email: payload.email,
      subject: "Password reset code",
      html: resetEmailTemplate(data),
    });
  } catch (error: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
};

const checkIsValidForgetActivationCode = async (payload: { email: string; code: string }) => {

  const account: any = await Auth.findOne({ email: payload.email }) as IAuth;
  if (!account) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Account does not exist!");
  }

  if (account.verifyCode !== payload.code) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid reset code!");
  }

  const currentTime = new Date();
  if (currentTime > account.verifyExpire) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Reset code has expired!");
  }
  const update = await Auth.updateOne(
    { email: account.email },
    { codeVerify: true }
  );
  account.verifyCode = null;
  await account.save();
  return update;
};

const resetPassword = async (req: { query: { email: string }; body: ResetPasswordPayload }) => {
  const { email } = req.query;
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Passwords do not match");
  }

  const auth = await Auth.findOne({ email }, { _id: 1, codeVerify: 1 });
  if (!auth) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found!");
  }

  if (!auth.codeVerify) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Your OTP is not verified!");
  }

  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  const result = await Auth.updateOne(
    { email },
    { password: hashedPassword, codeVerify: false }
  );
  return result;
};

const changePassword = async (user: { authId: Types.ObjectId }, payload: ChangePasswordPayload) => {
  const { authId } = user;

  const { oldPassword, newPassword, confirmPassword } = payload;
  if (newPassword !== confirmPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password and confirm password do not match");
  }
  const isUserExist = await Auth.findById(authId).select("+password");
  if (!isUserExist) {
    throw new ApiError(404, "Account does not exist!");
  }
  if (
    isUserExist.password &&
    !(await Auth.isPasswordMatched(oldPassword, isUserExist.password))
  ) {
    throw new ApiError(402, "Old password is incorrect");
  }
  isUserExist.password = newPassword
  await isUserExist.save();
};

const resendCodeActivationAccount = async (payload: { email: string }) => {
  const email = payload.email;
  const user = await Auth.findOne({ email }) as IAuth;

  if (!user.email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email not found!");
  }

  const activationCode = createActivationToken().activationCode;
  const expiryTime = new Date(Date.now() + 3 * 60 * 1000);
  user.activationCode = activationCode;
  user.verifyExpire = expiryTime;
  await user.save();

  sendResetEmail(
    user.email,
    `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Activation Code</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: auto;
                background: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #333;
            }
            p {
                color: #555;
                line-height: 1.5;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #999;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Hello, ${user.name}</h1>
            <p>Your activation code is: <strong>${activationCode}</strong></p>
            <p>Please use this code to activate your account. If you did not request this, please ignore this email.</p>
            <p>Thank you!</p>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} bdCalling</p>
            </div>
        </div>
    </body>
    </html>`
  );
};

const resendCodeForgotAccount = async (payload: ForgotPasswordPayload) => {
  const email = payload.email;

  if (!email) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email not found!");
  }
  const user = await Auth.findOne({ email });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found!");
  }
  const verifyCode = createActivationToken().activationCode;
  const expiryTime = new Date(Date.now() + 3 * 60 * 1000);
  user.verifyCode = verifyCode;
  user.verifyExpire = expiryTime;
  await user.save();

  sendResetEmail(
    user.email,
    `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Activation Code</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: auto;
                background: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #333;
            }
            p {
                color: #555;
                line-height: 1.5;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #999;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Hello, ${user.name}</h1>
            <p>Your activation code is: <strong>${verifyCode}</strong></p>
            <p>Please use this code to activate your account. If you did not request this, please ignore this email.</p>
            <p>Thank you!</p>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} bdCalling</p>
            </div>
        </div>
    </body>
    </html>`
  );
};

// Scheduled task to unset activationCode field
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const result = await Auth.updateMany(
      {
        isActive: false,
        expirationTime: { $lte: now },
        activationCode: { $ne: null },
      },
      {
        $unset: { activationCode: "" },
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(`Removed activation codes from ${result.modifiedCount} expired inactive users`);
    }
  } catch (error) {
    logger.error("Error removing activation codes from expired users:", error);
  }
});

// Scheduled task to unset codeVerify field
cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    const result = await Auth.updateMany(
      {
        isActive: false,
        verifyExpire: { $lte: now },
      },
      {
        $unset: { codeVerify: false },
      }
    );

    if (result.modifiedCount > 0) {
      logger.info(`Removed activation codes from ${result.modifiedCount} expired inactive users`);
    }
  } catch (error) {
    logger.error("Error removing activation codes from expired users:", error);
  }
});

const deleteMyAccount = async (payload: { authId: Types.ObjectId }) => {
  const { authId } = payload;

  const isUserExist = await Auth.findById(authId);

  if (!isUserExist) {
    throw new ApiError(404, "User does not exist");
  }

  let deletedUser = null;

  if (isUserExist.role === ENUM_USER_ROLE.CLIENT || isUserExist.role === ENUM_USER_ROLE.AGENT) {
    deletedUser = await Client.findOneAndDelete({ authId: isUserExist._id });
  } else if (
    isUserExist.role === ENUM_USER_ROLE.ADMIN ||
    isUserExist.role === ENUM_USER_ROLE.SUPER_ADMIN ||
    isUserExist.role === ENUM_USER_ROLE.MEMBER
  ) {
    deletedUser = await Member.findOneAndDelete({ authId: isUserExist._id });
  }

  if (!deletedUser) {
    throw new ApiError(404, "User details not found in Client or Member collection");
  }

  const deletedAuth = await Auth.findByIdAndDelete(authId);

  return {
    message: "Account deleted successfully",
    deletedAuth,
  };
};

const getALLUsers = async (searchTerm: string) => {
  let query = {};

  if (searchTerm) {
    query = {
      $or: [
        { email: { $regex: searchTerm, $options: "i" } },
      ],
    };
  }

  const users = await Auth.find(query).select('name email');

  return users;
}

export const AuthService = {
  registrationAccount,
  registrationUser,
  loginAccount,
  changePassword,
  forgotPass,
  resetPassword,
  deleteMyAccount,
  // activateAccount,
  checkIsValidForgetActivationCode,
  resendCodeActivationAccount,
  resendCodeForgotAccount,
  getALLUsers
};

