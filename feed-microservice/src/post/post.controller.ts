import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AllExceptionsFilter } from 'src/utils/exception.filter';
import * as swaggerDocument from '../docs/swagger/swagger.json';
import { CreatePostDto } from './dto/create-post.dto';
import { GetAllPostsDto } from './dto/get-all-posts.dto';
import { PostsStatsDto } from './dto/get-statistics.dto';
import { PostService } from './post.service';

@Controller('posts')
@UseFilters(AllExceptionsFilter)
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
  async listPosts(@Query() query: GetAllPostsDto) {
    return this.postService.listPosts(query);
  }

  @Get('statistics')
  getStats(): Promise<PostsStatsDto> {
    return this.postService.getStatistics();
  }

  @Get('/swagger')
  getSwaggerJson(@Res() res: Response) {
    return res.status(200).json(swaggerDocument);
  }
}
