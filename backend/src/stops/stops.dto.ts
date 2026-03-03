import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class NearbyStopsQueryDto {
  @ApiProperty()
  @Type(() => Number)
  @IsLatitude()
  lat!: number;

  @ApiProperty()
  @Type(() => Number)
  @IsLongitude()
  lon!: number;

  @ApiPropertyOptional({ default: 500 })
  @Type(() => Number)
  @Min(50)
  @Max(5000)
  radiusMeters: number = 500;

  @ApiPropertyOptional({ default: 30 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 30;
}

export class StopDeparturesQueryDto {
  @ApiPropertyOptional({ example: '2026-03-03' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;

  @ApiPropertyOptional({ example: '12:30:00' })
  @IsOptional()
  @Matches(/^\d{2}:\d{2}:\d{2}$/)
  time?: string;

  @ApiPropertyOptional({ default: 30 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit: number = 30;
}

export class StopRoutesQueryDto {
  @ApiPropertyOptional({ example: '2026-03-03' })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;

  @ApiPropertyOptional({ default: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit: number = 50;
}
