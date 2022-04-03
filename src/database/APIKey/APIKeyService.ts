import { generateSHA512, getUUIDV4 } from '@/utils/helper';
import { NotFoundError } from 'routing-controllers';
import app from '@/config/App';
import { ApiKeyDto } from '@/types/models/ApiKeyDto';
import { CreateApiKeyRequest } from '@/types/payloads/requests/CreateApiKeyRequest';
import { APIKey, DataProcessor, User } from '../models/index';
import queryBuilder from 'dbschema/edgeql-js/index';

const { db } = app;

export async function createAPIKey(
    userId: User['id'],
    payload: CreateApiKeyRequest
): Promise<{ apiKeyString: string }> {
    const dataProcessor = queryBuilder.select(queryBuilder.DataProcessor, (dataProcessor) => ({
        filter: queryBuilder.op(dataProcessor.id, '=', queryBuilder.uuid(userId)),
    }));
    const apiKeyString = getUUIDV4();
    await queryBuilder
        .insert(queryBuilder.APIKey, {
            prefix: apiKeyString.slice(0, 5),
            hash: generateSHA512(apiKeyString),
            hostname: payload.hostname,
            dataProcessor,
        })
        .run(db);

    return { apiKeyString };
}

export async function checkAPIKeyValid(
    suppliedApiKey: string,
    hostname: string
): Promise<DataProcessor['id']> {
    const existingApiKeySet = await queryBuilder
        .select(queryBuilder.APIKey, (apiKey) => ({
            filter: queryBuilder.op(apiKey.hash, '=', generateSHA512(suppliedApiKey)),
            hostname: true,
            dataProcessor: true,
        }))
        .run(db);
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
    return await queryBuilder
        .select(queryBuilder.APIKey, (apiKey) => ({
            filter: queryBuilder.op(apiKey.dataProcessor.id, '=', queryBuilder.uuid(userId)),
            id: true,
            prefix: true,
            hostname: true,
        }))
        .run(db);
}

export async function deleteAPIKey(id: APIKey['id']): Promise<void> {
    const result = await queryBuilder
        .delete(queryBuilder.APIKey, (apiKey) => ({
            filter: queryBuilder.op(apiKey.id, '=', queryBuilder.uuid(id)),
        }))
        .run(db);

    if (!result) {
        throw new NotFoundError('No API key matching the supplied ID was found.');
    }
}
