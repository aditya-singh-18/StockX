import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  IsDateString,
} from 'class-validator';
import { CustomerType, CustomerStatus } from '@prisma/client';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Rajesh Sharma', description: 'Primary contact person or business owner name' })
  @IsString()
  @IsNotEmpty({ message: 'Customer name is required' })
  name: string;

  @ApiProperty({ example: '+91 9876543210', description: 'Primary mobile/phone number' })
  @IsString()
  @IsNotEmpty({ message: 'Mobile number is required' })
  mobile: string;

  @ApiPropertyOptional({ example: 'rajesh@sharmatraders.in', description: 'Customer email address' })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional({ example: 'Sharma Traders Pvt Ltd', description: 'Registered business/firm name' })
  @IsOptional()
  @IsString()
  businessName?: string;

  @ApiPropertyOptional({ example: '27AABCS1429B1Z0', description: 'GST Identification Number' })
  @IsOptional()
  @IsString()
  gstNumber?: string;

  @ApiProperty({
    enum: CustomerType,
    example: CustomerType.WHOLESALE,
    description: 'Category of customer (RETAIL, WHOLESALE, DISTRIBUTOR)',
  })
  @IsEnum(CustomerType, {
    message: 'Type must be one of: RETAIL, WHOLESALE, DISTRIBUTOR',
  })
  @IsNotEmpty({ message: 'Customer type is required' })
  type: CustomerType;

  @ApiPropertyOptional({ example: '102 Industrial Area, Phase 2, Pune, MH', description: 'Physical/Billing address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    enum: CustomerStatus,
    example: CustomerStatus.LEAD,
    default: CustomerStatus.LEAD,
    description: 'CRM status of customer (LEAD, ACTIVE, INACTIVE)',
  })
  @IsOptional()
  @IsEnum(CustomerStatus, {
    message: 'Status must be one of: LEAD, ACTIVE, INACTIVE',
  })
  status?: CustomerStatus = CustomerStatus.LEAD;

  @ApiPropertyOptional({
    example: '2026-08-20T10:00:00.000Z',
    description: 'Scheduled follow-up date (ISO-8601 format)',
  })
  @IsOptional()
  @IsDateString({}, { message: 'followUpDate must be a valid ISO 8601 date string' })
  followUpDate?: string;
}
