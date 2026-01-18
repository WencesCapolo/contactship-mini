import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Lead } from '@prisma/client';

export interface LeadSummaryResult {
    summary: string;
    next_action: string;
}

@Injectable()
export class OpenAIService {
    private readonly logger = new Logger(OpenAIService.name);
    private readonly client: OpenAI;

    constructor(private readonly configService: ConfigService) {
        this.client = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    /**
     * Generate a summary and suggested next action for a lead
     * using GPT-4o-mini with a relationship-building focus
     */
    async summarizeLead(lead: Lead): Promise<LeadSummaryResult> {
        this.logger.log(`Generating AI summary for lead ${lead.id}`);

        const leadContext = this.buildLeadContext(lead);

        const response = await this.client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a CRM assistant specialized in relationship-building strategies. 
Your task is to analyze lead information and provide:
1. A concise summary of the lead (2-3 sentences max)
2. A suggested next action focused on building a genuine relationship

Respond in JSON format with exactly these fields:
{
  "summary": "...",
  "next_action": "..."
}

Focus on personalization, authentic connection, and understanding the person behind the data.`,
                },
                {
                    role: 'user',
                    content: `Please analyze this lead and provide a summary and next action:\n\n${leadContext}`,
                },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 300,
        });

        const content = response.choices[0]?.message?.content;

        if (!content) {
            throw new Error('No response content from OpenAI');
        }

        const parsed = JSON.parse(content) as LeadSummaryResult;

        this.logger.log(`Successfully generated summary for lead ${lead.id}`);

        return {
            summary: parsed.summary,
            next_action: parsed.next_action,
        };
    }

    /**
     * Build a context string from lead data for the AI prompt
     */
    private buildLeadContext(lead: Lead): string {
        const parts: string[] = [];

        parts.push(`Name: ${lead.firstName} ${lead.lastName}`);
        parts.push(`Email: ${lead.email}`);

        if (lead.phone) {
            parts.push(`Phone: ${lead.phone}`);
        }

        if (lead.city || lead.state || lead.country) {
            const location = [lead.city, lead.state, lead.country]
                .filter(Boolean)
                .join(', ');
            parts.push(`Location: ${location}`);
        }

        if (lead.gender) {
            parts.push(`Gender: ${lead.gender}`);
        }

        if (lead.dateOfBirth) {
            const age = this.calculateAge(lead.dateOfBirth);
            parts.push(`Age: ${age} years old`);
        }

        parts.push(`Source: ${lead.source === 'MANUAL' ? 'Manually added' : 'Imported from API'}`);
        parts.push(`Created: ${lead.createdAt.toISOString().split('T')[0]}`);

        return parts.join('\n');
    }

    /**
     * Calculate age from date of birth
     */
    private calculateAge(dateOfBirth: Date): number {
        const today = new Date();
        const birth = new Date(dateOfBirth);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    }
}
