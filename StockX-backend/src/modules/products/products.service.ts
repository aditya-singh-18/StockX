import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Prisma, StockMovementType, MovementSource } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { ProductQueryDto, MovementHistoryQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new product with initial stock = 0
   */
  async create(createProductDto: CreateProductDto) {
    const sku = createProductDto.sku.trim();

    // Check SKU uniqueness
    const existing = await this.prisma.product.findUnique({
      where: { sku },
    });

    if (existing) {
      throw new ConflictException(`A product with SKU '${sku}' already exists.`);
    }

    const product = await this.prisma.product.create({
      data: {
        name: createProductDto.name.trim(),
        sku,
        category: createProductDto.category?.trim() || null,
        unitPrice: new Prisma.Decimal(createProductDto.unitPrice),
        minStock: createProductDto.minStock,
        location: createProductDto.location?.trim() || null,
        currentStock: 0, // Fresh products start at 0 stock
      },
    });

    this.logger.log(`Created new product: ${product.name} (SKU: ${product.sku})`);
    return product;
  }

  /**
   * Get paginated products with search, category and lowStock filter
   */
  async findAll(query: ProductQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      lowStock,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const where: Prisma.ProductWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { sku: { contains: term, mode: 'insensitive' } },
        { category: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (category && category.trim()) {
      where.category = { equals: category.trim(), mode: 'insensitive' };
    }

    // Filter low stock products (currentStock <= minStock)
    if (lowStock === true) {
      const lowStockRows = await this.prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "products" WHERE "currentStock" <= "minStock"
      `;
      const ids = lowStockRows.map((r) => r.id);
      where.id = { in: ids };
    }

    const validSortFields = ['createdAt', 'name', 'sku', 'unitPrice', 'currentStock', 'minStock'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderByDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: {
          [orderByField]: orderByDirection,
        },
        include: {
          _count: {
            select: {
              stockMovements: true,
              challanItems: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / take) || 1;

    // Attach computed isLowStock flag
    const mappedProducts = products.map((p) => ({
      ...p,
      isLowStock: p.currentStock <= p.minStock,
    }));

    return {
      data: mappedProducts,
      total,
      page,
      limit: take,
      totalPages,
    };
  }

  /**
   * Get single product details by ID
   */
  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            stockMovements: true,
            challanItems: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    return {
      ...product,
      isLowStock: product.currentStock <= product.minStock,
    };
  }

  /**
   * Partial update for product metadata (currentStock is ignored/stripped)
   */
  async update(id: string, updateProductDto: UpdateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    const { name, sku, category, unitPrice, minStock, location } = updateProductDto;
    const data: Prisma.ProductUpdateInput = {};

    if (name !== undefined) data.name = name.trim();
    if (category !== undefined) data.category = category ? category.trim() : null;
    if (location !== undefined) data.location = location ? location.trim() : null;
    if (minStock !== undefined) data.minStock = minStock;
    if (unitPrice !== undefined) data.unitPrice = new Prisma.Decimal(unitPrice);

    if (sku !== undefined) {
      const trimmedSku = sku.trim();
      const skuConflict = await this.prisma.product.findFirst({
        where: {
          sku: trimmedSku,
          NOT: { id },
        },
      });

      if (skuConflict) {
        throw new ConflictException(`A product with SKU '${trimmedSku}' already exists.`);
      }
      data.sku = trimmedSku;
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data,
    });

    this.logger.log(`Updated product: ${updated.name} (SKU: ${updated.sku})`);
    return {
      ...updated,
      isLowStock: updated.currentStock <= updated.minStock,
    };
  }

  /**
   * Adjust stock (IN/OUT) atomically wrapped in a Prisma $transaction
   * Uses DB-level atomic conditional decrement (WHERE currentStock >= quantity)
   * to eliminate race conditions under concurrent requests.
   */
  async adjustStock(productId: string, dto: CreateStockMovementDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      let updatedProduct;

      if (dto.type === StockMovementType.OUT) {
        // 1. Atomic DB-level conditional decrement (guarantees no overdraft even under race conditions)
        const updateResult = await tx.product.updateMany({
          where: {
            id: productId,
            currentStock: { gte: dto.quantity },
          },
          data: {
            currentStock: { decrement: dto.quantity },
          },
        });

        // 2. If update count is 0, either product is missing or currentStock was insufficient
        if (updateResult.count === 0) {
          const currentProd = await tx.product.findUnique({ where: { id: productId } });
          if (!currentProd) {
            throw new NotFoundException(`Product with ID '${productId}' not found`);
          }
          throw new ConflictException(
            `Insufficient stock for product '${currentProd.name}' (SKU: ${currentProd.sku}). Available stock: ${currentProd.currentStock}, Requested reduction: ${dto.quantity}.`,
          );
        }

        updatedProduct = await tx.product.findUnique({ where: { id: productId } });
      } else {
        // IN movement: atomic increment
        try {
          updatedProduct = await tx.product.update({
            where: { id: productId },
            data: {
              currentStock: { increment: dto.quantity },
            },
          });
        } catch (error) {
          throw new NotFoundException(`Product with ID '${productId}' not found`);
        }
      }

      const newStock = updatedProduct.currentStock;

      // 3. Insert StockMovement audit log with accurate balanceAfter
      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantity: dto.quantity,
          type: dto.type,
          source: dto.source || MovementSource.MANUAL_ADJUSTMENT,
          note: dto.note ? dto.note.trim() : null,
          balanceAfter: newStock,
          createdById: userId,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      this.logger.log(
        `Atomic stock adjustment for '${updatedProduct.name}' (SKU: ${updatedProduct.sku}): ${dto.type} ${dto.quantity} | New Balance: ${newStock} | Source: ${movement.source}`,
      );

      return {
        product: {
          ...updatedProduct,
          isLowStock: updatedProduct.currentStock <= updatedProduct.minStock,
        },
        movement,
      };
    }, {
      maxWait: 10000,
      timeout: 30000,
    });
  }

  /**
   * Get paginated stock movement history for a product
   */
  async findMovements(productId: string, query: MovementHistoryQueryDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, sku: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID '${productId}' not found`);
    }

    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const [movements, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where: { productId },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          challan: {
            select: {
              id: true,
              challanNo: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.stockMovement.count({ where: { productId } }),
    ]);

    const totalPages = Math.ceil(total / take) || 1;

    return {
      product,
      data: movements,
      total,
      page,
      limit: take,
      totalPages,
    };
  }
}
