import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class TripStopTimesQueryDto {
  @ApiPropertyOptional({ default: 200 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit: number = 200;
}

export class TripShapeQueryDto {
  @ApiPropertyOptional({
    description: 'Override shape_id when you only have the shape id.',
  })
  @IsOptional()
  shapeId?: string;
}
