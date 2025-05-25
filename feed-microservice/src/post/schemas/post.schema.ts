import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
  @Prop({ required: true })
  creatorId: string;

  @Prop({ required: true })
  creatorEmail: string;

  @Prop({ required: true })
  userType: string;

  @Prop()
  comment?: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  imageUrl: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.set('timestamps', true);
