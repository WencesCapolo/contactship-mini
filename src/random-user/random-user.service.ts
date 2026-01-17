import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RandomUserApiResponse, RandomUser } from './interfaces/random-user-response.interface';

@Injectable()
export class RandomUserService {
    private readonly logger = new Logger(RandomUserService.name);

    constructor(private readonly httpService: HttpService) { }

    /**
     * Fetch random users from the randomuser.me API
     * @param count Number of users to fetch (default: 5)
     * @returns Array of random users
     */
    async fetchRandomUsers(count: number = 5): Promise<RandomUser[]> {
        try {
            this.logger.log(`Fetching ${count} random users from randomuser.me`);

            const response = await firstValueFrom(
                this.httpService.get<RandomUserApiResponse>('/', {
                    params: {
                        results: count,
                    },
                }),
            );

            this.logger.log(`Successfully fetched ${response.data.results.length} users`);
            return response.data.results;
        } catch (error) {
            this.logger.error('Failed to fetch random users', error);
            throw error;
        }
    }

    /**
     * Transform a RandomUser from the API into the format expected by our Lead model
     */
    transformToLeadData(user: RandomUser) {
        return {
            source: 'RANDOM_USER_API' as const,
            externalId: user.login.uuid,
            firstName: user.name.first,
            lastName: user.name.last,
            email: user.email,
            phone: user.phone || user.cell,
            street: `${user.location.street.number} ${user.location.street.name}`,
            city: user.location.city,
            state: user.location.state,
            country: user.location.country,
            postcode: String(user.location.postcode),
            gender: user.gender,
            dateOfBirth: new Date(user.dob.date),
            picture: user.picture.large,
        };
    }
}
