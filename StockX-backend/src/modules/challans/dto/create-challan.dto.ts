import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsUUID,
  Min,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateChallanItemDto {
  @ApiProperty({
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'Product UUID to include in sales challan',
  })
  @IsUUID('4', { message: 'productId must be a valid UUID' })
  @IsNotEmpty({ message: 'productId is required' })
  productId: string;

  @ApiProperty({
    example: 10,
    description: 'Quantity ordered (positive integer >= 1)',
  })
  @Type(() => Number)
  @IsInt({ message: 'quantity must be an integer' })
  @Min(1, { message: 'quantity must be at least 1' })
  @IsNotEmpty({ message: 'quantity is required' })
  quantity: number;
}

export class CreateChallanDto {
  @ApiProperty({
    example: 'b6bd6834-b96e-452b-a11b-6df6e76ef684',
    description: 'Target Customer UUID',
  })
  @IsUUID('4', { message: 'customerId must be a valid UUID' })
  @IsNotEmpty({ message: 'customerId is required' })
  customerId: string;

  @ApiProperty({
    type: [CreateChallanItemDto],
    description: 'Array of products and quantities to include in the challan',
  })
  @IsArray({ message: 'items must be an array' })
  @ArrayMinSize(1, { message: 'At least one item is required to create a sales challan' })
  @ValidateNested({ each: true })
  @Type(() => CreateChallanItemDto)
  items: CreateChallanItemDto[];
}
