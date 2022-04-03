import { IsUUID } from 'class-validator';

export class CheckConfirmationLinkValidRequest {
    @IsUUID(4)
    uuid!: string;
}
