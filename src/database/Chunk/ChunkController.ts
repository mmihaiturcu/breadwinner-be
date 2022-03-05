import { loggingMiddleware } from '@/config/loggingMiddleware.js';
import { Controller, UseAfter, Param, Get } from 'routing-controllers';
import { Chunk } from './Chunk.js';
import { getChunkOutput } from './ChunkService.js';

@Controller('/chunk')
export class ChunkController {
    @Get('/:id/output')
    @UseAfter(loggingMiddleware)
    async getChunkOutput(@Param('id') id: Chunk['id']) {
        return await getChunkOutput(id);
    }
}
