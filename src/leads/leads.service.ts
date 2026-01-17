import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RandomUserService } from '../random-user/random-user.service';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly randomUserService: RandomUserService,
  ) { }

  /**
   * Create a new lead manually
   */
  async create(createLeadDto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: {
        ...createLeadDto,
        source: 'MANUAL',
        dateOfBirth: createLeadDto.dateOfBirth
          ? new Date(createLeadDto.dateOfBirth)
          : undefined,
      },
    });
  }

  /**
   * Get all leads with optional pagination
   */
  async findAll(skip?: number, take?: number) {
    return this.prisma.lead.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single lead by ID
   */
  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${id} not found`);
    }

    return lead;
  }

  /**
   * Update a lead by ID
   */
  async update(id: string, updateLeadDto: UpdateLeadDto) {
    await this.findOne(id); // Throws if not found

    return this.prisma.lead.update({
      where: { id },
      data: {
        ...updateLeadDto,
        dateOfBirth: updateLeadDto.dateOfBirth
          ? new Date(updateLeadDto.dateOfBirth)
          : undefined,
      },
    });
  }

  /**
   * Delete a lead by ID
   */
  async remove(id: string) {
    await this.findOne(id); // Throws if not found

    return this.prisma.lead.delete({
      where: { id },
    });
  }

  /**
   * Sync leads from randomuser.me API
   * Uses upsert to avoid duplicates based on externalId
   */
  async syncFromRandomUser(count: number = 10) {
    this.logger.log(`Starting sync of ${count} leads from randomuser.me`);

    let syncedCount = 0;
    let errorMessage: string | null = null;

    try {
      // Fetch random users from the API
      const randomUsers = await this.randomUserService.fetchRandomUsers(count);

      // Transform and upsert each user
      for (const user of randomUsers) {
        const leadData = this.randomUserService.transformToLeadData(user);

        await this.prisma.lead.upsert({
          where: { externalId: leadData.externalId },
          update: leadData,
          create: leadData,
        });

        syncedCount++;
      }

      this.logger.log(`Successfully synced ${syncedCount} leads`);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Sync failed: ${errorMessage}`);
    }

    // Log the sync operation
    await this.prisma.syncLog.create({
      data: {
        leadsCount: syncedCount,
        success: errorMessage === null,
        errorMessage,
      },
    });

    return {
      syncedCount,
      success: errorMessage === null,
      errorMessage,
    };
  }

  /**
   * Get sync history
   */
  async getSyncLogs(limit: number = 10) {
    return this.prisma.syncLog.findMany({
      take: limit,
      orderBy: { syncedAt: 'desc' },
    });
  }
}

