import { Chunk } from '@/database/models';
import { OperandTypes } from '@/types/enums';

export interface DecryptPayloadDTOResponse {
    endResultType: OperandTypes;
    chunks: {
        id: Chunk['id'];
        length: Chunk['length'];
    }[];
}
