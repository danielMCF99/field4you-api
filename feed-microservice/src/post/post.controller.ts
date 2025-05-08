import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePostDto } from './dto/create-post.dto';
import { PostService } from './post.service';
import { GetAllPostsDtoSchema } from './dto/get-all-posts.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Headers() headers: Record<string, string>,
    @UploadedFile() file: Express.Multer.File,
    @Body() createPostDto: CreatePostDto,
  ) {
    return this.postService.create(headers, file, createPostDto);
  }

  @Delete(':id')
  remove(@Headers() headers: Record<string, string>, @Param('id') id: string) {
    return this.postService.remove(headers, id);
  }

  @Get('all')
  async listPosts(@Query() query: any) {
    const parsedQueryParams = GetAllPostsDtoSchema.safeParse(query);
    if (!parsedQueryParams.success) {
      throw new Error('Invalid query parameters');
    }

    return this.postService.listPosts(parsedQueryParams.data);
  }
}
