import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(250)
  comments?: string;

  @IsString()
  @MaxLength(250)
  imageName: string;

  @IsString()
  imageUrl: string;
}
