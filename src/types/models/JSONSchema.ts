import { OperationDTO } from '.';
import { SchemeType } from '../enums';

export interface JSONSchema {
    totalDataLength: number;
    schemeType: SchemeType;
    operations: OperationDTO[];
}
