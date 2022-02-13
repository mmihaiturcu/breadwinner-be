import { generateSHA512, getUUIDV4 } from '@/utils/helper.js';
import { NotFoundError } from 'routing-controllers';
import { APIKey } from './APIKey.js';

import app from '@/config/App.js';
import { ApiKeyDto } from '@/types/models/ApiKeyDto.js';
import { CreateApiKeyRequest } from '@/types/payloads/requests/CreateApiKeyRequest.js';

const apiKeyRepository = app.apiKeyRepository;
const dataProcessorRepository = app.dataProcessorRepository;

export async function createAPIKey(
    payload: CreateApiKeyRequest
): Promise<{ apiKey: APIKey; apiKeyString: string }> {
    const apiKeyString = getUUIDV4();
    const apiKey = new APIKey(
        apiKeyString.slice(0, 5),
        generateSHA512(apiKeyString),
        payload.hostname
    );
    apiKey.dataProcessor = await dataProcessorRepository.findById(payload.userId);
    return { apiKey: await apiKeyRepository.save(apiKey), apiKeyString };
}

export async function checkAPIKeyValid(apiKey: string, hostname: string): Promise<boolean> {
    const existingApiKey = await apiKeyRepository.findByHash(generateSHA512(apiKey));
    if (existingApiKey) {
        if (existingApiKey.hostname === hostname) {
            return true;
        } else {
            throw new NotFoundError('API Key not found or not matching hostname.');
        }
    } else {
        throw new NotFoundError('API Key not found or not matching hostname.');
    }
}

export async function getApiKeysForUser(userId: number): Promise<ApiKeyDto[]> {
    const apiKeys = await apiKeyRepository.getApiKeysByUserId(userId);

    return apiKeys;
}
