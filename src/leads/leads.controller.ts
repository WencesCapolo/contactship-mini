import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadsQueueService } from '../leads-queue/leads-queue.service';

@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly leadsQueueService: LeadsQueueService,
  ) { }

  /**
   * POST /leads - Create a new lead (queued for async processing)
   * Returns the job ID for tracking
   */
  @Post()
  async create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsQueueService.addCreateLeadJob(createLeadDto);
  }

  /**
   * POST /leads/:id/summarize - Queue a lead for AI summarization
   * Sets aiStatus to PROCESSING and returns 202 with job tracking info
   */
  @Post(':id/summarize')
  @HttpCode(HttpStatus.ACCEPTED)
  async summarize(@Param('id') id: string) {
    // Verify lead exists and set status to PROCESSING
    await this.leadsService.setAiProcessing(id);

    // Add job to queue
    const { jobId } = await this.leadsQueueService.addSummarizeJob(id);

    return {
      message: 'AI Summarization started',
      leadId: id,
      status: 'PROCESSING',
      jobId,
    };
  }

  /**
   * GET /leads/jobs/:jobId - Get job status
   */
  @Get('jobs/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.leadsQueueService.getJobStatus(jobId);
  }

  /**
   * POST /leads/sync - Sync leads from randomuser.me API
   * @param count Number of leads to sync (default: 10)
   */
  @Post('sync')
  sync(
    @Query('count', new DefaultValuePipe(10), ParseIntPipe) count: number,
  ) {
    return this.leadsService.syncFromRandomUser(count);
  }

  /**
   * GET /leads/sync/logs - Get sync history
   */
  @Get('sync/logs')
  getSyncLogs(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.leadsService.getSyncLogs(limit);
  }

  /**
   * GET /leads - Get all leads
   */
  @Get()
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take: number,
  ) {
    return this.leadsService.findAll(skip, take);
  }

  /**
   * GET /leads/:id - Get a single lead by ID
   */
  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000) // 60 seconds
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  /**
   * PATCH /leads/:id - Update a lead by ID
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  /**
   * DELETE /leads/:id - Delete a lead by ID
   */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
