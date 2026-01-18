import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(
        private readonly configService: ConfigService,
        private readonly reflector: Reflector,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        // Check if the route is marked as public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const apiKey = this.extractApiKey(request);

        if (!apiKey) {
            throw new UnauthorizedException('API key is missing');
        }

        const validApiKey = this.configService.get<string>('API_KEY');

        if (!validApiKey) {
            throw new UnauthorizedException('API key is not configured on server');
        }

        if (apiKey !== validApiKey) {
            throw new UnauthorizedException('Invalid API key');
        }

        return true;
    }

    private extractApiKey(request: Request): string | undefined {
        // Check x-api-key header first (most common)
        const headerKey = request.headers['x-api-key'];
        if (headerKey) {
            return Array.isArray(headerKey) ? headerKey[0] : headerKey;
        }

        // Fallback: check Authorization header with ApiKey scheme
        const authHeader = request.headers.authorization;
        if (authHeader?.startsWith('ApiKey ')) {
            return authHeader.substring(7);
        }

        // Fallback: check query parameter (less secure, but useful for testing)
        const queryKey = request.query['api_key'];
        if (queryKey) {
            return Array.isArray(queryKey) ? queryKey[0] as string : queryKey as string;
        }

        return undefined;
    }
}
