import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import Auth from '../auth/auth.model';
import { RequestData } from '../../../interfaces/common';
import Member from './member.model';
import { Types } from 'mongoose';
import { GetAllGetQuery } from '../service/service.interface';
import QueryBuilder from '../../../builder/QueryBuilder';
import { IReqUser } from '../auth/auth.interface';

const updateMyProfile = async (req: RequestData) => {
  const { files, body: data } = req;
  const { authId, userId } = req.user;

  const checkValidDriver = await Member.findById(userId);
  if (!checkValidDriver) {
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
      { address: updatedUserData.address, phone_number: updatedUserData.phone_number, name: updatedUserData.name, profile_image: updatedUserData.profile_image },
      {
        new: true,
      }
    ),
    Member.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
      runValidators: true,
    }),
  ]);

  return result;
};

const updateProfile = async (req: RequestData) => {
  const { files, } = req;
  const data = req.body;
  const { authId, userId } = req.params as any;

  const checkValidDriver = await Member.findById(userId);
  if (!checkValidDriver) {
    throw new ApiError(404, "User not found.");
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
      { address: updatedUserData.address, phone_number: updatedUserData.phone_number, name: updatedUserData.name, profile_image: updatedUserData.profile_image, role: updatedUserData.role, },
      {
        new: true,
      }
    ),
    Member.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
      runValidators: true,
    }),
  ]);

  return result;
};

const myProfile = async (user: { userId: Types.ObjectId }) => {
  const userId = user.userId;
  const result = await Member.findById(userId).populate("authId");
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const auth = await Auth.findById(result.authId);
  if (auth?.is_block) {
    throw new ApiError(httpStatus.FORBIDDEN, "You are blocked. Contact support");
  }

  return result;
};

const getAllMembersWithOutPagination = async (query: GetAllGetQuery) => {
  const { searchTerm } = query;

  const filter: any = {};

  if (searchTerm) {
    filter.$and = [
      {
        $or: [
          { name: { $regex: searchTerm, $options: "i" } },
          { email: { $regex: searchTerm, $options: "i" } },
        ],
      },
    ];
  }

  const result = await Member.find(filter).select("name _id email role");
  return result;
};

const getAllMembers = async (user: IReqUser, query: GetAllGetQuery) => {

  const userQuery = new QueryBuilder(Member.find({ role: { $in: ["MEMBER", "ADMIN"] } }).populate('serviceId', 'title price _id'), query)
    .search(["name", "email"])
    .filter()
    .sort()
    .paginate()
    .fields()


  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return { meta, result };
};



export const MemberService = {
  myProfile,
  updateProfile,
  getAllMembersWithOutPagination,
  getAllMembers,
  updateMyProfile
};

