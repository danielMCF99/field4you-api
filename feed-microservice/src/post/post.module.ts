import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    FirebaseModule,
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
