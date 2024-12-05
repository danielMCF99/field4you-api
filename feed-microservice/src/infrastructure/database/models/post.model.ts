import { Schema, model, Document, Types } from 'mongoose';

interface IPostDocument extends Document {
  _id: Types.ObjectId;
  creatorId: string;
  creatorEmail: string;
  comments?: string;
  imageName: string;
  imageURL: string;
  creationDate: Date;
}

const postSchema = new Schema<IPostDocument>({
  creatorId: { type: String, required: true },
  creatorEmail: {
    type: String,
    required: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  },
  comments: { type: String },
  imageName: { type: String, required: true },
  imageURL: { type: String, required: true },
  creationDate: { type: Date, default: new Date() },
});

export const PostModel = model<IPostDocument>('Post', postSchema);
