import { generateSHA512, getUUIDV4 } from '@/utils/helper.js';
import { NotFoundError } from 'routing-controllers';
import { APIKey } from './APIKey.js';

import app from '@/config/App.js';

const apiKeyRepository = app.apiKeyRepository;

export async function createAPIKey(
    hostname: string
): Promise<{ apiKey: APIKey; apiKeyString: string }> {
    const apiKeyString = getUUIDV4();
    const apiKey = new APIKey(apiKeyString.slice(0, 5), generateSHA512(apiKeyString), hostname);
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
