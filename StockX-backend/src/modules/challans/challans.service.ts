import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Prisma, ChallanStatus, StockMovementType, MovementSource } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateChallanDto } from './dto/create-challan.dto';
import { ChallanQueryDto } from './dto/challan-query.dto';

@Injectable()
export class ChallansService {
  private readonly logger = new Logger(ChallansService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new sales challan in DRAFT status with frozen price/name snapshots.
   * Auto-generates sequential calendar year challan numbers (e.g. CH-2026-00001).
   * Stock is NOT touched at draft creation.
   */
  async create(createChallanDto: CreateChallanDto, userId: string) {
    const { customerId, items } = createChallanDto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Verify customer exists
      const customer = await tx.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw new NotFoundException(`Customer with ID '${customerId}' not found`);
      }

      // 2. Generate sequential calendar year challan number safely
      const currentYear = new Date().getFullYear();
      const prefix = `CH-${currentYear}-`;

      const yearChallanCount = await tx.challan.count({
        where: {
          challanNo: { startsWith: prefix },
        },
      });

      let sequence = yearChallanCount + 1;
      let challanNo = `${prefix}${String(sequence).padStart(5, '0')}`;

      // Guarantee collision-free number under concurrent requests
      let existingChallan = await tx.challan.findUnique({ where: { challanNo } });
      while (existingChallan) {
        sequence += 1;
        challanNo = `${prefix}${String(sequence).padStart(5, '0')}`;
        existingChallan = await tx.challan.findUnique({ where: { challanNo } });
      }

      // 3. Process items, create snapshots and compute totals
      let totalQty = 0;
      let totalAmountNumber = 0;
      const itemsToCreate = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Product with ID '${item.productId}' not found`);
        }

        const price = Number(product.unitPrice);
        const itemTotal = price * item.quantity;
        totalAmountNumber += itemTotal;
        totalQty += item.quantity;

        itemsToCreate.push({
          productId: item.productId,
          quantity: item.quantity,
          productNameSnapshot: product.name,
          unitPriceSnapshot: product.unitPrice,
        });
      }

      // 4. Create Draft Challan
      const challan = await tx.challan.create({
        data: {
          challanNo,
          status: ChallanStatus.DRAFT,
          totalQty,
          totalAmount: new Prisma.Decimal(totalAmountNumber),
          customerId,
          createdById: userId,
          items: {
            create: itemsToCreate,
          },
        },
        include: {
          customer: true,
          items: true,
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          confirmedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      this.logger.log(`Created Draft Challan ${challan.challanNo} for customer ${customer.name} (Amount: ₹${totalAmountNumber})`);
      return challan;
    });
  }

  /**
   * Get paginated challans with search and status/customer filters
   */
  async findAll(query: ChallanQueryDto) {
    const {
      page = 1,
      limit = 10,
      status,
      customerId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const where: Prisma.ChallanWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { challanNo: { contains: term, mode: 'insensitive' } },
        { customer: { name: { contains: term, mode: 'insensitive' } } },
        { customer: { mobile: { contains: term, mode: 'insensitive' } } },
        { customer: { businessName: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const validSortFields = ['createdAt', 'challanNo', 'totalQty', 'totalAmount', 'status'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderByDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const [challans, total] = await Promise.all([
      this.prisma.challan.findMany({
        where,
        skip,
        take,
        orderBy: {
          [orderByField]: orderByDirection,
        },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              businessName: true,
              mobile: true,
              type: true,
            },
          },
          items: true,
          _count: {
            select: {
              items: true,
              stockMovements: true,
            },
          },
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          confirmedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.challan.count({ where }),
    ]);

    const totalPages = Math.ceil(total / take) || 1;

    return {
      data: challans,
      total,
      page,
      limit: take,
      totalPages,
    };
  }

  /**
   * Get single challan details with snapshot items, customer, and movements
   */
  async findOne(id: string) {
    const challan = await this.prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                sku: true,
                currentStock: true,
                category: true,
              },
            },
          },
        },
        stockMovements: {
          orderBy: { createdAt: 'desc' },
          include: {
            createdBy: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        confirmedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!challan) {
      throw new NotFoundException(`Challan with ID '${id}' not found`);
    }

    return challan;
  }

  /**
   * Confirm Sales Challan (THE CRITICAL ATOMIC TRANSACTION)
   * Deducts inventory atomically with DB-level conditional updates.
   * If ANY item fails stock check, rolls back the entire transaction.
   * Sets confirmedById = userId (the user who calls confirm).
   */
  async confirm(id: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Fetch challan with items
      const challan = await tx.challan.findUnique({
        where: { id },
        include: {
          items: true,
          customer: true,
        },
      });

      if (!challan) {
        throw new NotFoundException(`Challan with ID '${id}' not found`);
      }

      if (challan.status === ChallanStatus.CONFIRMED) {
        throw new ConflictException(`Challan '${challan.challanNo}' has already been confirmed.`);
      }

      if (challan.status === ChallanStatus.CANCELLED) {
        throw new ConflictException(`Cannot confirm cancelled challan '${challan.challanNo}'.`);
      }

      const stockMovementsCreated = [];

      // 2. Atomically deduct inventory for each item using conditional updates
      for (const item of challan.items) {
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.productId,
            currentStock: { gte: item.quantity }, // Atomic DB-level condition
          },
          data: {
            currentStock: { decrement: item.quantity },
          },
        });

        // If update failed, stock was insufficient -> Roll back entire transaction
        if (updateResult.count === 0) {
          const currentProd = await tx.product.findUnique({ where: { id: item.productId } });
          const availableStock = currentProd ? currentProd.currentStock : 0;
          const productSku = currentProd ? currentProd.sku : 'UNKNOWN';

          this.logger.warn(
            `Challan confirmation aborted for ${challan.challanNo}: Insufficient stock for '${item.productNameSnapshot}' (SKU: ${productSku}). Available: ${availableStock}, Requested: ${item.quantity}`,
          );

          throw new ConflictException(
            `Insufficient stock for product '${item.productNameSnapshot}' (SKU: ${productSku}). Available stock: ${availableStock}, Requested quantity: ${item.quantity}. Entire challan confirmation rolled back (no stock deducted).`,
          );
        }

        // Fetch updated stock balance for audit logging
        const updatedProduct = await tx.product.findUnique({ where: { id: item.productId } });

        // Create StockMovement audit trail record
        const movement = await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: StockMovementType.OUT,
            source: MovementSource.CHALLAN_CONFIRMED,
            note: `Challan ${challan.challanNo} confirmed`,
            balanceAfter: updatedProduct.currentStock,
            challanId: challan.id,
            createdById: userId,
          },
        });

        stockMovementsCreated.push(movement);
      }

      // 3. Mark Challan as CONFIRMED with timestamp and confirmedById
      const confirmedChallan = await tx.challan.update({
        where: { id },
        data: {
          status: ChallanStatus.CONFIRMED,
          confirmedAt: new Date(),
          confirmedById: userId,
        },
        include: {
          customer: true,
          items: true,
          stockMovements: {
            include: {
              createdBy: { select: { id: true, name: true, email: true } },
            },
          },
          createdBy: { select: { id: true, name: true, email: true } },
          confirmedBy: { select: { id: true, name: true, email: true } },
        },
      });

      this.logger.log(
        `Successfully confirmed Challan ${confirmedChallan.challanNo} by user ${userId} (${stockMovementsCreated.length} items deducted atomically)`,
      );

      return {
        challan: confirmedChallan,
        stockMovements: stockMovementsCreated,
      };
    });
  }

  /**
   * Cancel a draft challan
   */
  async cancel(id: string) {
    const challan = await this.prisma.challan.findUnique({
      where: { id },
    });

    if (!challan) {
      throw new NotFoundException(`Challan with ID '${id}' not found`);
    }

    if (challan.status === ChallanStatus.CONFIRMED) {
      throw new ConflictException(
        `Cannot cancel confirmed challan '${challan.challanNo}'. Stock reversal on confirmed challans is out of scope for this version.`,
      );
    }

    if (challan.status === ChallanStatus.CANCELLED) {
      throw new ConflictException(`Challan '${challan.challanNo}' is already cancelled.`);
    }

    const updated = await this.prisma.challan.update({
      where: { id },
      data: {
        status: ChallanStatus.CANCELLED,
      },
      include: {
        customer: true,
        items: true,
        createdBy: { select: { id: true, name: true, email: true } },
        confirmedBy: { select: { id: true, name: true, email: true } },
      },
    });

    this.logger.log(`Cancelled Draft Challan ${updated.challanNo}`);
    return updated;
  }
}
