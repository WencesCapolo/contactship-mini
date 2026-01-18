import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { RandomUserModule } from '../random-user/random-user.module';
import { PrismaModule } from '../prisma/prisma.module';
import { LeadsQueueModule } from '../leads-queue/leads-queue.module';

@Module({
  imports: [RandomUserModule, PrismaModule, LeadsQueueModule],
  controllers: [LeadsController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule { }

