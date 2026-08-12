import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @ApiPropertyOptional({
    example: 'Industrial SMPS 24V 10A Pro',
    description: 'Updated product name',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    example: 'PWR-24V-10A-V2',
    description: 'Updated SKU (must be unique)',
  })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({
    example: 'Power Systems',
    description: 'Updated category',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 2500.0,
    description: 'Updated unit price',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Unit price must be a valid decimal number' })
  @Min(0.01, { message: 'Unit price must be greater than 0' })
  unitPrice?: number;

  @ApiPropertyOptional({
    example: 25,
    description: 'Updated minimum stock alert threshold',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Minimum stock must be an integer' })
  @Min(0, { message: 'Minimum stock cannot be negative' })
  minStock?: number;

  @ApiPropertyOptional({
    example: 'Rack A-14, Pune Central Warehouse',
    description: 'Updated warehouse location',
  })
  @IsOptional()
  @IsString()
  location?: string;
}
