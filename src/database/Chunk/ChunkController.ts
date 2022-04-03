import { authenticationMiddleware, loggingMiddleware } from '@/middleware/index';
import { Controller, UseAfter, Param, Get, UseBefore } from 'routing-controllers';
import { getChunkOutput } from './ChunkService';

@UseBefore(authenticationMiddleware)
@UseAfter(loggingMiddleware)
@Controller('/chunk')
export class ChunkController {
    @Get('/:id/output')
    async getChunkOutput(@Param('id') id: string) {
        return await getChunkOutput(id);
    }
}
