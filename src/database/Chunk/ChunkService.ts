import app from '@/config/App.js';
import { Chunk } from '../Chunk/Chunk.js';
import { readFileSync } from 'fs';

const chunkRepository = app.chunkRepository;

export async function getChunkOutput(id: Chunk['id']) {
    const chunk = (await chunkRepository.getChunkOutputPath(id)) as unknown as {
        outputPath: Chunk['outputPath'];
    };
    const output = readFileSync(chunk.outputPath, 'utf-8');

    return output;
}
