import { APIKey } from '@/database/models';

export type ApiKeyDto = Pick<APIKey, 'prefix' | 'hostname' | 'createdAt'>;
