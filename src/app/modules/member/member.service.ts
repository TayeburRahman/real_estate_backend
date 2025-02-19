import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import Auth from '../auth/auth.model';
import { RequestData } from '../../../interfaces/common';
import Member from './member.model';
import { Types } from 'mongoose';
import { GetAllGetQuery } from '../service/service.interface';
import QueryBuilder from '../../../builder/QueryBuilder';
import { IReqUser } from '../auth/auth.interface';

const updateProfile = async (req: RequestData) => {
  const { files, body: data } = req;
  const { authId, userId } = req.user

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
      { name: updatedUserData.name },
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

  const filter: any = { role: "MEMBER" };

  if (searchTerm) {
    filter.$and = [
      { role: "MEMBER" },
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

  const userQuery = new QueryBuilder(Member.find({ role: "MEMBER" }), query)
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
  getAllMembers
};

