import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../guards/api-key.guard';

/**
 * Decorator to mark a route as public (no API key required)
 * Use this on controllers or individual route handlers
 * 
 * @example
 * @Public()
 * @Get('health')
 * healthCheck() { return 'OK'; }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
