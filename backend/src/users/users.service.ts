import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async createUser(params: {
    email: string;
    passwordHash: string;
    displayName?: string;
  }): Promise<UserDocument> {
    const created = new this.userModel({
      email: params.email,
      passwordHash: params.passwordHash,
      displayName: params.displayName,
    });

    return created.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async addRefreshToken(userId: string, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $push: { refreshTokens: { tokenHash, expiresAt } },
    });
  }

  async removeRefreshToken(userId: string, tokenHash: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: { tokenHash } },
    });
  }

  async clearRefreshTokens(userId: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(userId, {
      $set: { refreshTokens: [] },
    });
  }
}
