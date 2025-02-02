import httpStatus from "http-status";
import ApiError from "../../../errors/ApiError";
import Auth from "../auth/auth.model";
import { Request } from "express";
import { IAdmin } from "./admin.interface";
import Admin from "./admin.model";

interface IRequest extends Request {
  user: {
    userId: string;
    authId: string;
  };
}

const updateProfile = async (req: IRequest): Promise<IAdmin | null> => {
  const { files } = req as any;
  const { userId, authId } = req.user;

  const data = req.body;
  if (!data) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Data is missing in the request body!");
  }

  const checkUser = await Admin.findById(userId);
  if (!checkUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  const checkAuth = await Auth.findById(authId);
  if (!checkAuth) {
    throw new ApiError(httpStatus.FORBIDDEN, "You are not authorized");
  }

  let profile_image: string | undefined;
  if (files?.profile_image) {
    profile_image = `/images/profile/${files.profile_image[0].filename}`;
  }

  let cover_image: string | undefined;
  if (files?.cover_image) {
    cover_image = `/images/cover/${files.cover_image[0].filename}`;
  }

  const updatedData = {
    ...data,
    ...(profile_image && { profile_image }),
    ...(cover_image && { cover_image }),
  };

  await Auth.findOneAndUpdate(
    { _id: authId },
    { name: updatedData.name },
    { new: true }
  );

  const updateUser = await Admin.findOneAndUpdate({ authId }, updatedData, {
    new: true,
  }).populate("authId");

  return updateUser;
};

const myProfile = async (req: IRequest): Promise<IAdmin | null> => {
  const { userId } = req.user;
  const result = await Admin.findById(userId).populate("authId");
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found!");
  }

  return result;
};

const deleteMyAccount = async (payload: { email: string; password: string }): Promise<void> => {
  const { email, password } = payload;

  const isUserExist = await Auth.isAuthExist(email);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User does not exist");
  }

  if (
    isUserExist.password &&
    !(await Auth.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(httpStatus.PAYMENT_REQUIRED, "Password is incorrect");
  }

  await Admin.deleteOne({ authId: isUserExist._id });
  await Auth.deleteOne({ email });
};

export const AdminService = {
  updateProfile,
  myProfile,
  deleteMyAccount,
};

 
