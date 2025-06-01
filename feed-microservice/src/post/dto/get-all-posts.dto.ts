import { Type } from 'class-transformer';
import {
  IsEmail,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class GetAllPostsDto {
  @IsOptional()
  creatorEmail?: string;

  @IsOptional()
  userType?: string;

  @IsOptional()
  profileImageUrl?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}
