import { EntityRepository, Repository } from 'typeorm';
import { Confirmation } from './Confirmation.js';

@EntityRepository(Confirmation)
export class ConfirmationRepository extends Repository<Confirmation> {
    findByUUID(uuid: Confirmation['uuid']) {
        return this.findOne({ uuid });
    }
}
