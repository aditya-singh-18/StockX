import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({
    example: 'Industrial SMPS 24V 10A',
    description: 'Product display name',
  })
  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  name: string;

  @ApiProperty({
    example: 'PWR-24V-10A',
    description: 'Unique Stock Keeping Unit (SKU) code',
  })
  @IsString()
  @IsNotEmpty({ message: 'SKU is required' })
  sku: string;

  @ApiPropertyOptional({
    example: 'Power Electronics',
    description: 'Product category or department',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    example: 2450.0,
    description: 'Unit selling price (must be positive)',
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Unit price must be a valid decimal number' })
  @Min(0.01, { message: 'Unit price must be greater than 0' })
  @IsNotEmpty({ message: 'Unit price is required' })
  unitPrice: number;

  @ApiProperty({
    example: 20,
    description: 'Minimum stock alert threshold (integer >= 0)',
  })
  @Type(() => Number)
  @IsInt({ message: 'Minimum stock must be an integer' })
  @Min(0, { message: 'Minimum stock cannot be negative' })
  @IsNotEmpty({ message: 'minStock is required' })
  minStock: number;

  @ApiPropertyOptional({
    example: 'Rack A-12, Pune Central Warehouse',
    description: 'Storage warehouse location or bin identifier',
  })
  @IsOptional()
  @IsString()
  location?: string;
}
