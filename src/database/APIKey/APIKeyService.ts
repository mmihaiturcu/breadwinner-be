import { generateSHA512, getUUIDV4 } from '@/utils/helper';
import { NotFoundError } from 'routing-controllers';
import app from '@/config/App';
import { ApiKeyDto } from '@/types/models/ApiKeyDto';
import { CreateApiKeyRequest } from '@/types/payloads/requests/CreateApiKeyRequest';
import { APIKey, DataProcessor, User } from '../models/index';
import { addAPIKey, deleteAPIKeyById, getAPIKeyByHash, getUserApiKeys } from './APIKeyRepository';

const { db } = app;

export async function createAPIKey(
    userId: User['id'],
    payload: CreateApiKeyRequest
): Promise<{ apiKeyString: string }> {
    const apiKeyString = getUUIDV4();
    await addAPIKey({
        apiKey: apiKeyString,
        hostname: payload.hostname,
        dataProcessorId: userId,
    }).run(db);

    return { apiKeyString };
}

export async function checkAPIKeyValid(
    suppliedApiKey: string,
    hostname: string
): Promise<DataProcessor['id']> {
    const existingApiKeySet = await getAPIKeyByHash(generateSHA512(suppliedApiKey)).run(db);
    if (existingApiKeySet) {
        const apiKey = existingApiKeySet[0];
        if (apiKey) {
            if (apiKey.hostname === hostname) {
                return apiKey.dataProcessor.id;
            } else {
                throw new NotFoundError('API Key not found or not matching hostname.');
            }
        } else {
            throw new NotFoundError('API Key not found or not matching hostname.');
        }
    } else {
        throw new NotFoundError('API Key not found or not matching hostname.');
    }
}

export async function getApiKeysForUser(userId: User['id']): Promise<ApiKeyDto[]> {
    return await getUserApiKeys(userId).run(db);
}

export async function deleteAPIKey(id: APIKey['id']): Promise<void> {
    const result = await deleteAPIKeyById(id).run(db);

    if (!result) {
        throw new NotFoundError('No API key matching the supplied ID was found.');
    }
}
