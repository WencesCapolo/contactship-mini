import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LeadsService } from '../leads/leads.service';

@Injectable()
export class SyncService {
    private readonly logger = new Logger(SyncService.name);

    constructor(private readonly leadsService: LeadsService) { }

    @Cron(CronExpression.EVERY_HOUR)
    async handleCron() {
        this.logger.log('Running scheduled lead sync...');
        try {
            const result = await this.leadsService.syncFromRandomUser(10);
            this.logger.log(
                `Sync completed. Synced: ${result.syncedCount}, Success: ${result.success}`,
            );
        } catch (error) {
            this.logger.error('Error during scheduled sync', error);
        }
    }
}
