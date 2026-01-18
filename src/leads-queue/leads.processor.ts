import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { RandomUserService } from '../random-user/random-user.service';
import { OpenAIService } from '../openai/openai.service';

export interface CreateLeadJobData {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    gender?: string;
    dateOfBirth?: string;
    picture?: string;
}

export interface SummarizeLeadJobData {
    leadId: string;
}

@Processor('leads')
export class LeadsProcessor extends WorkerHost {
    private readonly logger = new Logger(LeadsProcessor.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly randomUserService: RandomUserService,
        private readonly openAIService: OpenAIService,
    ) {
        super();
    }

    async process(job: Job<CreateLeadJobData | SummarizeLeadJobData>): Promise<any> {
        this.logger.log(`Processing job ${job.id} of type ${job.name}`);

        switch (job.name) {
            case 'create-lead':
                return this.handleCreateLead(job as Job<CreateLeadJobData>);
            case 'summarize-lead':
                return this.handleSummarizeLead(job as Job<SummarizeLeadJobData>);
            default:
                this.logger.warn(`Unknown job type: ${job.name}`);
                throw new Error(`Unknown job type: ${job.name}`);
        }
    }

    private async handleCreateLead(job: Job<CreateLeadJobData>) {
        const data = job.data;
        this.logger.log(`Creating lead for ${data.email}`);

        const lead = await this.prisma.lead.create({
            data: {
                ...data,
                source: 'MANUAL',
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
            },
        });

        this.logger.log(`Lead created with ID: ${lead.id}`);
        return { leadId: lead.id };
    }

    private async handleSummarizeLead(job: Job<SummarizeLeadJobData>) {
        const { leadId } = job.data;
        this.logger.log(`Summarizing lead ${leadId}`);

        const lead = await this.prisma.lead.findUnique({
            where: { id: leadId },
        });

        if (!lead) {
            throw new Error(`Lead with ID ${leadId} not found`);
        }

        try {
            // Call OpenAI to generate summary and next action
            const result = await this.openAIService.summarizeLead(lead);

            // Update lead with AI results and set status to COMPLETED
            const updatedLead = await this.prisma.lead.update({
                where: { id: leadId },
                data: {
                    aiStatus: 'COMPLETED',
                    aiSummary: result.summary,
                    nextAction: result.next_action,
                },
            });

            this.logger.log(`Lead ${leadId} summarized successfully`);
            return {
                summary: updatedLead.aiSummary,
                next_action: updatedLead.nextAction,
            };
        } catch (error) {
            // Update lead status to FAILED on error
            await this.prisma.lead.update({
                where: { id: leadId },
                data: {
                    aiStatus: 'FAILED',
                },
            });

            this.logger.error(`Failed to summarize lead ${leadId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }

    @OnWorkerEvent('completed')
    onCompleted(job: Job) {
        this.logger.log(`Job ${job.id} completed successfully`);
    }

    @OnWorkerEvent('failed')
    onFailed(job: Job, error: Error) {
        this.logger.error(`Job ${job.id} failed: ${error.message}`);
    }
}

