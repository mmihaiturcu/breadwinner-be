import { Chunk } from '@/database/models/index';
import { OperandTypes, SchemeType } from '@/types/enums';

export interface DecryptPayloadDTOResponse {
    endResultType: OperandTypes;
    schemeType: SchemeType;
    chunks: {
        id: Chunk['id'];
        length: Chunk['length'];
    }[];
}
