import { APIKey } from '@/database/models';

export type ApiKeyDto = Pick<APIKey, 'id' | 'prefix' | 'hostname' | 'createdAt'>;
