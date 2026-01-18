import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateLeadJobData, SummarizeLeadJobData } from './leads.processor';

@Injectable()
export class LeadsQueueService {
    private readonly logger = new Logger(LeadsQueueService.name);

    constructor(
        @InjectQueue('leads') private readonly leadsQueue: Queue,
    ) { }

    /**
     * Add a lead creation job to the queue
     */
    async addCreateLeadJob(data: CreateLeadJobData) {
        const job = await this.leadsQueue.add('create-lead', data, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        });

        this.logger.log(`Added create-lead job ${job.id} for ${data.email}`);
        return { jobId: job.id };
    }

    /**
     * Add a lead summarization job to the queue
     */
    async addSummarizeJob(leadId: string) {
        const data: SummarizeLeadJobData = { leadId };

        const job = await this.leadsQueue.add('summarize-lead', data, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
        });

        this.logger.log(`Added summarize-lead job ${job.id} for lead ${leadId}`);
        return { jobId: job.id };
    }

    /**
     * Get job status by ID
     */
    async getJobStatus(jobId: string) {
        const job = await this.leadsQueue.getJob(jobId);

        if (!job) {
            return null;
        }

        const state = await job.getState();

        return {
            id: job.id,
            name: job.name,
            state,
            progress: job.progress,
            data: job.data,
            returnvalue: job.returnvalue,
            failedReason: job.failedReason,
            timestamp: job.timestamp,
            finishedOn: job.finishedOn,
        };
    }
}
