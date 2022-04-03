import { Chunk } from '@/database/models/index';
import { OperandTypes } from '@/types/enums';

export interface DecryptPayloadDTOResponse {
    endResultType: OperandTypes;
    chunks: {
        id: Chunk['id'];
        length: Chunk['length'];
    }[];
}
