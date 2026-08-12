import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ChallansService } from './challans.service';
import { CreateChallanDto } from './dto/create-challan.dto';
import { ChallanQueryDto } from './dto/challan-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Challans')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('challans')
export class ChallansController {
  constructor(private readonly challansService: ChallansService) {}

  @Post()
  @RequirePermissions('challan:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new sales challan in DRAFT status with frozen price/name snapshots',
  })
  @ApiResponse({ status: 201, description: 'Challan created successfully in DRAFT status' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 404, description: 'Customer or Product not found' })
  @ApiResponse({ status: 403, description: 'Forbidden: Missing challan:create permission' })
  async create(
    @Body() createChallanDto: CreateChallanDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.challansService.create(createChallanDto, user.id);
  }

  @Get()
  @RequirePermissions('challan:read')
  @ApiOperation({ summary: 'Get paginated list of sales challans with search and status filters' })
  @ApiResponse({ status: 200, description: 'Returns paginated challans list' })
  @ApiResponse({ status: 403, description: 'Forbidden: Missing challan:read permission' })
  async findAll(@Query() query: ChallanQueryDto) {
    return this.challansService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('challan:read')
  @ApiOperation({ summary: 'Get single challan detail with items, customer, and movements' })
  @ApiParam({ name: 'id', description: 'Challan UUID' })
  @ApiResponse({ status: 200, description: 'Returns challan details' })
  @ApiResponse({ status: 404, description: 'Challan not found' })
  @ApiResponse({ status: 403, description: 'Forbidden: Missing challan:read permission' })
  async findOne(@Param('id') id: string) {
    return this.challansService.findOne(id);
  }

  @Post(':id/confirm')
  @RequirePermissions('challan:confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm challan: Atomically checks & deducts inventory, creates stock movement audit logs',
  })
  @ApiParam({ name: 'id', description: 'Challan UUID' })
  @ApiResponse({
    status: 200,
    description: 'Challan confirmed successfully. Stock deducted atomically.',
  })
  @ApiResponse({ status: 404, description: 'Challan not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict: Insufficient stock for one or more items (entire transaction rolled back)',
  })
  @ApiResponse({ status: 403, description: 'Forbidden: Missing challan:confirm permission' })
  async confirm(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.challansService.confirm(id, user.id);
  }

  @Post(':id/cancel')
  @RequirePermissions('challan:cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a draft sales challan' })
  @ApiParam({ name: 'id', description: 'Challan UUID' })
  @ApiResponse({ status: 200, description: 'Draft challan cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Challan not found' })
  @ApiResponse({ status: 409, description: 'Conflict: Cannot cancel a confirmed challan' })
  @ApiResponse({ status: 403, description: 'Forbidden: Missing challan:cancel permission' })
  async cancel(@Param('id') id: string) {
    return this.challansService.cancel(id);
  }
}
