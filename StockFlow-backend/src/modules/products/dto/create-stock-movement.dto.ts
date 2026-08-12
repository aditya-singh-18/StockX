import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StockMovementType, MovementSource } from '@prisma/client';

export class CreateStockMovementDto {
  @ApiProperty({
    example: 50,
    description: 'Quantity to adjust (must be positive integer > 0)',
  })
  @Type(() => Number)
  @IsInt({ message: 'Quantity must be an integer' })
  @Min(1, { message: 'Quantity must be at least 1' })
  @IsNotEmpty({ message: 'Quantity is required' })
  quantity: number;

  @ApiProperty({
    enum: StockMovementType,
    example: StockMovementType.IN,
    description: 'Movement direction (IN to add stock, OUT to deduct stock)',
  })
  @IsEnum(StockMovementType, {
    message: 'Type must be either IN or OUT',
  })
  @IsNotEmpty({ message: 'Movement type is required' })
  type: StockMovementType;

  @ApiPropertyOptional({
    enum: MovementSource,
    example: MovementSource.MANUAL_ADJUSTMENT,
    default: MovementSource.MANUAL_ADJUSTMENT,
    description: 'Operational source/reason for this stock adjustment',
  })
  @IsOptional()
  @IsEnum(MovementSource, {
    message: 'Source must be one of: MANUAL_ADJUSTMENT, CHALLAN_CONFIRMED, CHALLAN_CANCELLED_REVERSAL, PURCHASE_RECEIVED, DAMAGED, RETURNED',
  })
  source?: MovementSource = MovementSource.MANUAL_ADJUSTMENT;

  @ApiPropertyOptional({
    example: 'Received batch #B-904 from supplier shipment',
    description: 'Optional descriptive note for audit trail',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
