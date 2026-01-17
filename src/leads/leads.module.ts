import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { RandomUserModule } from '../random-user/random-user.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [RandomUserModule, PrismaModule],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule { }
