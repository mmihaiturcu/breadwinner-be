import { OperationDTO } from '.';
import { SchemeType } from '../enums';

export interface JSONSchema {
    schemeType: SchemeType;
    operations: OperationDTO[];
}
