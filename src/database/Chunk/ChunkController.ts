import { authenticationMiddleware, loggingMiddleware } from '@/middleware/index.js';
import { Controller, UseAfter, Param, Get, UseBefore } from 'routing-controllers';
import { Chunk } from './Chunk.js';
import { getChunkOutput } from './ChunkService.js';

@UseBefore(authenticationMiddleware)
@UseAfter(loggingMiddleware)
@Controller('/chunk')
export class ChunkController {
    @Get('/:id/output')
    async getChunkOutput(@Param('id') id: Chunk['id']) {
        return await getChunkOutput(id);
    }
}
