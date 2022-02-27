import { Operations } from '../enums';

export interface OperationDTO {
    name: Operations;
    operands: (string | number)[];
}
