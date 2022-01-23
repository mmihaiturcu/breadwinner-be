import { EntityRepository, Repository } from 'typeorm';
import { Confirmation } from '../Confirmation/Confirmation';
import { User } from './User';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    findByEmail(email: User['email']) {
        return this.findOne({ email });
    }
    findByConfirmationUuid(confirmationUuid: Confirmation['uuid']) {
        return this.findOne({
            relations: ['confirmation'],
            where: {
                confirmation: {
                    uuid: confirmationUuid,
                },
            },
        });
    }
}
