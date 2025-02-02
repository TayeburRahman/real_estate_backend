import mongoose, { Schema, Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../../../config';
import validator from 'validator';
import { IAuth, IAuthModel } from './auth.interface';
 

const AuthSchema: Schema<IAuth> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: "Please provide a valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },
    role: {
      type: String,
      enum: ["USER", "PARTNER", "ADMIN", "SUPER_ADMIN"],
      required: true,
    },
    verifyCode: {
      type: String,
    },
    codeVerify: {
      type: Boolean,
      default: false,
    },
    activationCode: {
      type: String,
    },
    verifyExpire: {
      type: Date,
    },
    expirationTime: {
      type: Date,
      default: () => Date.now() + 2 * 60 * 1000,
    },
    is_block: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Check if Auth exists
AuthSchema.statics.isAuthExist = async function (email: string): Promise<IAuth | null> {
  return await this.findOne(
    { email },
    {
      _id: 1,
      email: 1,
      password: 1,
      role: 1,
      isActive: 1,
      is_block: 1,
    }
  );
};

// Check password match
AuthSchema.statics.isPasswordMatched = async function (
  givenPassword: string,
  savedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword);
};

// Hash the password
AuthSchema.pre<IAuth>('save', async function (next) {
  
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );
  next();
});

// Model
const Auth: IAuthModel = mongoose.model<IAuth, IAuthModel>('Auth', AuthSchema);

export default Auth;
