import { JwtPayload } from 'jsonwebtoken';
import * as express from 'express';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
    interface Request {
      user: JwtPayload | null;
      files?: {
        [key: string]: Express.Multer.File[];  
      };
    }
  }
}
