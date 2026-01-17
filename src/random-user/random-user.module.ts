import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RandomUserService } from './random-user.service';

@Module({
    imports: [
        HttpModule.register({
            baseURL: 'https://randomuser.me/api',
            timeout: 10000,
        }),
    ],
    providers: [RandomUserService],
    exports: [RandomUserService],
})
export class RandomUserModule { }
