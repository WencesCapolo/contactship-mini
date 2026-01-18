import {
  Controller,
  Get,
  Post,
  Body,
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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { LeadsQueueService } from '../leads-queue/leads-queue.service';

@ApiTags('leads')
@ApiSecurity('x-api-key')
@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly leadsQueueService: LeadsQueueService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Create a new lead', description: 'Queues lead creation for async processing' })
  @ApiResponse({ status: 201, description: 'Lead creation job queued successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Invalid API key' })
  async create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsQueueService.addCreateLeadJob(createLeadDto);
  }

  @Post(':id/summarize')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Queue AI summarization', description: 'Starts AI-powered lead summarization using GPT-4o-mini' })
  @ApiParam({ name: 'id', description: 'Lead UUID' })
  @ApiResponse({ status: 202, description: 'Summarization job started' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async summarize(@Param('id') id: string) {
    await this.leadsService.setAiProcessing(id);
    const { jobId } = await this.leadsQueueService.addSummarizeJob(id);

    return {
      message: 'AI Summarization started',
      leadId: id,
      status: 'PROCESSING',
      jobId,
    };
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get job status', description: 'Check the status of async job by ID' })
  @ApiParam({ name: 'jobId', description: 'BullMQ job ID' })
  @ApiResponse({ status: 200, description: 'Job status retrieved' })
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.leadsQueueService.getJobStatus(jobId);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync leads from Random User API', description: 'Fetches and imports leads from randomuser.me' })
  @ApiQuery({ name: 'count', required: false, type: Number, description: 'Number of leads to sync (default: 10)' })
  @ApiResponse({ status: 201, description: 'Sync completed' })
  sync(
    @Query('count', new DefaultValuePipe(10), ParseIntPipe) count: number,
  ) {
    return this.leadsService.syncFromRandomUser(count);
  }

  @Get('sync/logs')
  @ApiOperation({ summary: 'Get sync history', description: 'Returns sync operation logs' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of logs to return (default: 10)' })
  @ApiResponse({ status: 200, description: 'Sync logs retrieved' })
  getSyncLogs(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.leadsService.getSyncLogs(limit);
  }

  @Get()
  @ApiOperation({ summary: 'List all leads', description: 'Returns paginated list of leads' })
  @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Records to skip (default: 0)' })
  @ApiQuery({ name: 'take', required: false, type: Number, description: 'Records to return (default: 50)' })
  @ApiResponse({ status: 200, description: 'Leads retrieved' })
  findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(50), ParseIntPipe) take: number,
  ) {
    return this.leadsService.findAll(skip, take);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  @ApiOperation({ summary: 'Get lead by ID', description: 'Returns a single lead (cached for 60s)' })
  @ApiParam({ name: 'id', description: 'Lead UUID' })
  @ApiResponse({ status: 200, description: 'Lead found' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a lead', description: 'Permanently removes a lead' })
  @ApiParam({ name: 'id', description: 'Lead UUID' })
  @ApiResponse({ status: 200, description: 'Lead deleted' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
