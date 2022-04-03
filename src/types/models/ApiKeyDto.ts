import { APIKey } from '@/database/models/index';

export type ApiKeyDto = Pick<APIKey, 'id' | 'prefix' | 'hostname'>;
