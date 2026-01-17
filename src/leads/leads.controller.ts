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
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) { }

  /**
   * POST /leads - Create a new lead manually
   */
  @Post()
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
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

