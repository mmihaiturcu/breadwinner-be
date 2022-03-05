import { Operand } from '.';
import { OperandTypes, Operations } from '../enums';

export interface OperationDTO {
    name: Operations;
    operands: Operand[];
    resultType: OperandTypes;
}
