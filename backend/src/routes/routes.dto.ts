import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Matches, Max, Min } from 'class-validator';

export class RouteTripsQueryDto {
  @ApiPropertyOptional({ example: '2026-03-03' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;

  @ApiPropertyOptional({ example: '12:30:00' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}:\d{2}$/)
  time?: string;

  @ApiPropertyOptional({ default: 60 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit: number = 60;
}

export class RouteStopsQueryDto {
  @ApiPropertyOptional({ example: '2026-03-03' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;

  @ApiPropertyOptional({ default: 200 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit: number = 200;
}
