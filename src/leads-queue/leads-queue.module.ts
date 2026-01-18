import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { LeadsProcessor } from './leads.processor';
import { LeadsQueueService } from './leads-queue.service';
import { PrismaModule } from '../prisma/prisma.module';
import { RandomUserModule } from '../random-user/random-user.module';
import { OpenAIModule } from '../openai/openai.module';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'leads',
        }),
        PrismaModule,
        RandomUserModule,
        OpenAIModule,
    ],
    providers: [LeadsProcessor, LeadsQueueService],
    exports: [LeadsQueueService],
})
export class LeadsQueueModule { }

