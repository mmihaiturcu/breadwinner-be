import { Operand } from '.';
import { OperandTypes, OperationType } from '../enums';

export interface OperationDTO {
    type: OperationType;
    operands: Operand[];
    resultType: OperandTypes;
}
