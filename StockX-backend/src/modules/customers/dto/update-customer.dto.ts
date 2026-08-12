import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsEmail,
  IsDateString,
} from 'class-validator';
import { CustomerType, CustomerStatus } from '@prisma/client';

export class UpdateCustomerDto {
  @ApiPropertyOptional({ example: 'Rajesh Sharma', description: 'Customer name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: '+91 9876543210', description: 'Mobile number' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({ example: 'rajesh@sharmatraders.in', description: 'Customer email' })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional({ example: 'Sharma Traders Pvt Ltd', description: 'Business name' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({ example: '27AABCS1429B1Z0', description: 'GST Identification Number' })
  @IsOptional()
  @IsString()
  gstNumber?: string;

  @ApiPropertyOptional({
    enum: CustomerType,
    example: CustomerType.WHOLESALE,
    description: 'Category of customer (RETAIL, WHOLESALE, DISTRIBUTOR)',
  })
  @IsOptional()
  @IsEnum(CustomerType, {
    message: 'Type must be one of: RETAIL, WHOLESALE, DISTRIBUTOR',
  })
  type?: CustomerType;

  @ApiPropertyOptional({ example: '102 Industrial Area, Phase 2, Pune, MH', description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    enum: CustomerStatus,
    example: CustomerStatus.ACTIVE,
    description: 'CRM status (LEAD, ACTIVE, INACTIVE)',
  })
  @IsOptional()
  @IsEnum(CustomerStatus, {
    message: 'Status must be one of: LEAD, ACTIVE, INACTIVE',
  })
  status?: CustomerStatus;

  @ApiPropertyOptional({
    example: '2026-08-25T10:00:00.000Z',
    description: 'Scheduled follow-up date (ISO-8601 format)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'followUpDate must be a valid ISO 8601 date string' })
  followUpDate?: string;
}
