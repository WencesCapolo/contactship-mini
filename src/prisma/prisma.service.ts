import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const connectionString = process.env.DATABASE_URL;
        const adapter = new PrismaPg({ connectionString });
        super({ adapter });
    }
    async onModuleInit() {
        // Connect to the database when the module initializes
        await this.$connect();
    }

    async onModuleDestroy() {
        // Disconnect from the database when the app shuts down
        await this.$disconnect();
    }
}
