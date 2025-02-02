import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import Auth from '../auth/auth.model'; 
import { IReqUser } from '../auth/auth.interface';
import { RequestData } from '../../../interfaces/common';
import Partner from './partner.model';

 

interface DeleteAccountPayload {
  email: string;
  password: string;
}

const updateProfile = async (req: RequestData) => {
  const { files, body: data } = req;
  const { authId, userId } = req.user 

  const checkValidDriver = await Partner.findById(userId);
  if (!checkValidDriver) {
    throw new ApiError(404, "You are not authorized");
  }

  const fileUploads: Record<string, string> = {};
  if (files) {
    if (files.profile_image && files.profile_image[0]) {
      fileUploads.profile_image = `/images/profile/${files.profile_image[0].filename}`;
    }
    if (files.licensePlateImage && files.licensePlateImage[0]) {
      fileUploads.licensePlateImage = `/images/vehicle-licenses/${files.licensePlateImage[0].filename}`;
    }
    if (files.drivingLicenseImage && files.drivingLicenseImage[0]) {
      fileUploads.drivingLicenseImage = `/images/driving-licenses/${files.drivingLicenseImage[0].filename}`;
    }
    if (files.vehicleInsuranceImage && files.vehicleInsuranceImage[0]) {
      fileUploads.vehicleInsuranceImage = `/images/insurance/${files.vehicleInsuranceImage[0].filename}`;
    }
    if (files.vehicleRegistrationCardImage && files.vehicleRegistrationCardImage[0]) {
      fileUploads.vehicleRegistrationCardImage = `/images/vehicle-registration/${files.vehicleRegistrationCardImage[0].filename}`;
    }
    if (files.vehicleFrontImage && files.vehicleFrontImage[0]) {
      fileUploads.vehicleFrontImage = `/images/vehicle-image/${files.vehicleFrontImage[0].filename}`;
    }
    if (files.vehicleBackImage && files.vehicleBackImage[0]) {
      fileUploads.vehicleBackImage = `/images/vehicle-image/${files.vehicleBackImage[0].filename}`;
    }
    if (files.vehicleSideImage && files.vehicleSideImage[0]) {
      fileUploads.vehicleSideImage = `/images/vehicle-image/${files.vehicleSideImage[0].filename}`;
    }
  }

  const updatedUserData = { ...data, ...fileUploads };

  const [, result] = await Promise.all([
    Auth.findByIdAndUpdate(
      authId,
      { name: updatedUserData.name },
      {
        new: true,
      }
    ),
    Partner.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
      runValidators: true,
    }),
  ]);

  return result;
};

const getProfile = async (user: { userId: string }) => {
  const userId = user.userId;
  const result = await Partner.findById(userId).populate("authId");
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const auth = await Auth.findById(result.authId);
  if (auth?.is_block) {
    throw new ApiError(httpStatus.FORBIDDEN, "You are blocked. Contact support");
  }

  return result;
};

const deleteMyAccount = async (payload: DeleteAccountPayload) => {
  const { email, password } = payload;

  const isUserExist = await Auth.isAuthExist(email);

  if (!isUserExist) {
    throw new ApiError(404, "User does not exist");
  }

  if (
    isUserExist.password &&
    !(await Auth.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(402, "Password is incorrect");
  }

  await Partner.deleteOne({ authId: isUserExist._id });
  return await Auth.deleteOne({ email });
};

export const PartnerService = {
  getProfile,
  deleteMyAccount,
  updateProfile,
};
 
