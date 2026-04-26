import mongoose, { HydratedDocument, Model, Schema } from 'mongoose'

export interface User {
  name: string
  email: string
  passwordHash: string
  rating: number
  createdAt: Date
  updatedAt: Date
}

export type UserDocument = HydratedDocument<User>
export type UserModel = Model<User>

const userSchema = new Schema<User, UserModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      default: 1200,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
)



export const UserEntity = mongoose.model<User, UserModel>('User', userSchema)
