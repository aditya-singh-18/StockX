import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Prisma, CustomerStatus, CustomerType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { CustomerQueryDto } from './dto/customer-query.dto';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new customer
   */
  async create(createCustomerDto: CreateCustomerDto) {
    const { followUpDate, ...rest } = createCustomerDto;

    const data: Prisma.CustomerCreateInput = {
      ...rest,
      status: rest.status || CustomerStatus.LEAD,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
    };

    const customer = await this.prisma.customer.create({
      data,
    });

    this.logger.log(`Created new customer: ${customer.name} (${customer.id})`);
    return customer;
  }

  /**
   * Get paginated customer list with search and filters
   */
  async findAll(query: CustomerQueryDto) {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      type,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;
    const take = Math.min(limit, 100);

    const where: Prisma.CustomerWhereInput = {};

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { mobile: { contains: term, mode: 'insensitive' } },
        { businessName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    const validSortFields = ['createdAt', 'name', 'businessName', 'status', 'type', 'followUpDate'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const orderByDirection = sortOrder === 'asc' ? 'asc' : 'desc';

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: {
          [orderByField]: orderByDirection,
        },
        include: {
          _count: {
            select: {
              notes: true,
              challans: true,
            },
          },
        },
      }),
      this.prisma.customer.count({ where }),
    ]);

    const totalPages = Math.ceil(total / take) || 1;

    return {
      data: customers,
      total,
      page,
      limit: take,
      totalPages,
    };
  }

  /**
   * Get full customer details with notes timeline and recent challans
   */
  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        notes: {
          orderBy: { createdAt: 'desc' },
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
        challans: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            challanNo: true,
            status: true,
            totalQty: true,
            totalAmount: true,
            createdAt: true,
            confirmedAt: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID '${id}' not found`);
    }

    return customer;
  }

  /**
   * Partial update customer profile
   */
  async update(id: string, updateCustomerDto: UpdateCustomerDto) {
    // Check customer existence
    const exists = await this.prisma.customer.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!exists) {
      throw new NotFoundException(`Customer with ID '${id}' not found`);
    }

    const { followUpDate, ...rest } = updateCustomerDto;

    const data: Prisma.CustomerUpdateInput = {
      ...rest,
    };

    if (followUpDate !== undefined) {
      data.followUpDate = followUpDate ? new Date(followUpDate) : null;
    }

    const updated = await this.prisma.customer.update({
      where: { id },
      data,
    });

    this.logger.log(`Updated customer: ${updated.name} (${updated.id})`);
    return updated;
  }

  /**
   * Add a follow-up note linked to customer and authenticated author
   */
  async addNote(customerId: string, createNoteDto: CreateNoteDto, userId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { id: true },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID '${customerId}' not found`);
    }

    const note = await this.prisma.customerNote.create({
      data: {
        note: createNoteDto.note.trim(),
        customerId,
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

    this.logger.log(`Added note for customer ${customerId} by user ${userId}`);
    return note;
  }

  /**
   * Delete customer (Hard delete for Admin)
   */
  async remove(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            challans: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID '${id}' not found`);
    }

    if (customer._count.challans > 0) {
      throw new BadRequestException(
        `Cannot delete customer with ${customer._count.challans} linked sales challan(s). Please archive or set status to INACTIVE.`,
      );
    }

    await this.prisma.customer.delete({
      where: { id },
    });

    this.logger.log(`Deleted customer: ${customer.name} (${id})`);
    return { success: true, message: `Customer '${customer.name}' deleted successfully` };
  }
}
