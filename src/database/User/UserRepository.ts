import { EntityRepository, Repository } from 'typeorm';
import { Confirmation } from '../Confirmation/Confirmation.js';
import { User } from './User.js';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
    findById(id: User['id']) {
        return this.findOne({ id });
    }
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
    async existsByEmail(email: User['email']): Promise<boolean> {
        return (
            (await this.createQueryBuilder('entity')
                .where('entity.email= :value', { value: email })
                .getCount()) > 0
        );
    }
}
