import { IsInt, IsNumber, IsObject, Min } from 'class-validator';

export class PostsStatsDto {
  @IsInt()
  @Min(0)
  last30DaysCount: number;

  @IsInt()
  @Min(0)
  previous30DaysCount: number;

  @IsNumber()
  differencePercentage: number;

  @IsObject()
  postsPerDay: PostsPerDay[];
}

class PostsPerDay {
  date: string;

  @IsInt()
  @Min(0)
  count: number;
}
