import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import Auth from '../auth/auth.model';
import { RequestData } from '../../../interfaces/common';
import Client from './client.model';
import QueryBuilder from '../../../builder/QueryBuilder';


const updateMyProfile = async (req: RequestData) => {
  const { files, body: data } = req;
  const { authId, userId } = req.user;

  const checkValidClient = await Client.findById(userId);
  if (!checkValidClient) {
    throw new ApiError(404, "You are not authorized");
  }

  const fileUploads: Record<string, string> = {};
  if (files) {
    if (files.profile_image && files.profile_image[0]) {
      fileUploads.profile_image = `/images/profile/${files.profile_image[0].filename}`;
    }
    if (files.cover_image && files.cover_image[0]) {
      fileUploads.cover_image = `/images/profile/${files.cover_image[0].filename}`;
    }
  }

  const updatedUserData = { ...data, ...fileUploads };

  const [auth, result] = await Promise.all([
    Auth.findByIdAndUpdate(
      authId,
      { address: updatedUserData.address, phone_number: updatedUserData.phone_number, name: updatedUserData.name },
      {
        new: true,
      }
    ),
    Client.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
      runValidators: true,
    }),
  ]);

  return { result, auth };
};

const updateProfile = async (req: RequestData) => {
  const { files, body: data } = req;
  const { authId, userId } = req.params as any

  const checkValidClient = await Client.findById(userId);
  if (!checkValidClient) {
    throw new ApiError(404, "You are not authorized");
  }

  const fileUploads: Record<string, string> = {};
  if (files) {
    if (files.profile_image && files.profile_image[0]) {
      fileUploads.profile_image = `/images/profile/${files.profile_image[0].filename}`;
    }
    if (files.cover_image && files.cover_image[0]) {
      fileUploads.cover_image = `/images/profile/${files.cover_image[0].filename}`;
    }
  }

  const updatedUserData = { ...data, ...fileUploads };

  const [auth, result] = await Promise.all([
    Auth.findByIdAndUpdate(
      authId,
      { address: updatedUserData.address, phone_number: updatedUserData.phone_number, name: updatedUserData.name },
      {
        new: true,
      }
    ),
    Client.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
      runValidators: true,
    }),
  ]);

  return { result, auth };
};

const getProfile = async (user: { userId: string }) => {
  const userId = user.userId;
  const result = await Client.findById(userId).populate("authId");
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const auth = await Auth.findById(result.authId);
  if (auth?.is_block) {
    throw new ApiError(httpStatus.FORBIDDEN, "You are blocked. Contact support");
  }

  return result;
};

const getAllClients = async (query: any) => {
  const userQuery = new QueryBuilder(Client.find({ role: "CLIENT" }), query)
    .search(["name", "email"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return { meta, result };
};

const getClientAgent = async (query: any) => {
  if (!query.clientId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing Client ID");
  }
  const result = await Client.find({ role: "AGENT", clientId: query.clientId })

  return result;
};




export const ClientService = {
  getProfile,
  updateProfile,
  getAllClients,
  updateMyProfile,
  getClientAgent
};

