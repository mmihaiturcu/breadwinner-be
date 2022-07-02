import { getDataProcessorById } from '../User/UserRepository';
import { generateSHA512 } from '@/utils/helper';
import { APIKey, User } from '../models';
import queryBuilder from 'dbschema/edgeql-js/index';

export function addAPIKey({
    apiKey,
    hostname,
    dataProcessorId,
}: {
    apiKey: string;
    hostname: string;
    dataProcessorId: string;
}) {
    return queryBuilder.insert(queryBuilder.APIKey, {
        prefix: apiKey.slice(0, 5),
        hash: generateSHA512(apiKey),
        hostname: hostname,
        dataProcessor: getDataProcessorById(dataProcessorId),
    });
}

export function getAPIKeyByHash(hash: string) {
    return queryBuilder.select(queryBuilder.APIKey, (apiKey) => ({
        filter: queryBuilder.op(apiKey.hash, '=', hash),
        hostname: true,
        dataProcessor: true,
    }));
}

export function getUserApiKeys(id: User['id']) {
    return queryBuilder.select(queryBuilder.APIKey, (apiKey) => ({
        filter: queryBuilder.op(apiKey.dataProcessor.id, '=', queryBuilder.uuid(id)),
        id: true,
        prefix: true,
        hostname: true,
    }));
}

export function deleteAPIKeyById(id: APIKey['id']) {
    return queryBuilder.delete(queryBuilder.APIKey, (apiKey) => ({
        filter: queryBuilder.op(apiKey.id, '=', queryBuilder.uuid(id)),
    }));
}
