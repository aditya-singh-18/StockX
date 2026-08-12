import {
  Controller,
  Get,
  Post,
  Patch,
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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { ProductQueryDto, MovementHistoryQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Products')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @RequirePermissions('product:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new product in the catalog (currentStock starts at 0)' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Conflict: Product SKU already exists' })
  @ApiResponse({ status: 403, description: 'Forbidden: Missing product:create permission' })
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @RequirePermissions('product:read')
  @ApiOperation({ summary: 'Get paginated product catalog with search, category & lowStock filters' })
  @ApiResponse({ status: 200, description: 'Returns paginated product catalog' })
  @ApiResponse({ status: 403, description: 'Forbidden: Missing product:read permission' })
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('product:read')
  @ApiOperation({ summary: 'Get single product details with recent stock movements' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Returns product details' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Forbidden: Missing product:read permission' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('product:update')
  @ApiOperation({ summary: 'Update product metadata (name, sku, category, price, minStock, location)' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 409, description: 'Conflict: SKU already taken by another product' })
  @ApiResponse({ status: 403, description: 'Forbidden: Missing product:update permission' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  @Post(':id/stock-movements')
  @RequirePermissions('product:stock-adjust')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Adjust inventory stock (IN/OUT) with atomic balance calculation and audit logging',
  })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({
    status: 201,
    description: 'Stock adjusted successfully. Returns updated product and movement record.',
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({
    status: 409,
    description: 'Conflict: Insufficient stock for OUT movement (negative stock prevented)',
  })
  @ApiResponse({ status: 403, description: 'Forbidden: Missing product:stock-adjust permission' })
  async adjustStock(
    @Param('id') id: string,
    @Body() createStockMovementDto: CreateStockMovementDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.productsService.adjustStock(id, createStockMovementDto, user.id);
  }

  @Get(':id/stock-movements')
  @RequirePermissions('product:read')
  @ApiOperation({ summary: 'Get paginated stock movement audit history for a product' })
  @ApiParam({ name: 'id', description: 'Product UUID' })
  @ApiResponse({ status: 200, description: 'Returns paginated movement history' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 403, description: 'Forbidden: Missing product:read permission' })
  async findMovements(
    @Param('id') id: string,
    @Query() query: MovementHistoryQueryDto,
  ) {
    return this.productsService.findMovements(id, query);
  }
}
