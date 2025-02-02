import { NextFunction, Request, Response } from 'express';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import httpStatus from 'http-status';
import { jwtHelpers } from '../../helpers/jwtHelpers';
import User from '../modules/auth/auth.model';

const auth =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenWithBearer = req.headers.authorization;

      if (!tokenWithBearer) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          'You are not authorized for this role',
        );
      }

      if (tokenWithBearer && tokenWithBearer.startsWith('Bearer')) {
        const token = tokenWithBearer.split(' ')[1];

        const verifyUser = jwtHelpers.verifyToken(
          token,
          config.jwt.secret as Secret,
        );

        req.user = verifyUser;
        const isExist = await User.findById(verifyUser?.userId);

        if (!isExist) {
          throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
        }

        if (roles.length && !roles.includes(verifyUser.role)) {
          throw new ApiError(
            httpStatus.FORBIDDEN,
            'Access Forbidden: You do not have permission to perform this action',
          );
        }
        next();
      }
    } catch (error) {
      next(error);
    }
  };

export default auth;
