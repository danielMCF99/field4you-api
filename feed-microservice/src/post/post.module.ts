import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './schemas/post.schema';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    FirebaseModule,
    HttpModule,
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
