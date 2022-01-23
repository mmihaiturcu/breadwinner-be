import { User, APIKey, JSONSchema } from '@/database/models/index.js';
import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DataSupplier {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { primary: true, cascade: true })
    userDetails: User;

    @OneToOne(() => APIKey, { primary: true, cascade: true })
    apiKey: APIKey;

    @OneToMany(() => JSONSchema, (jsonSchema) => jsonSchema.dataSupplier)
    jsonSchemas: JSONSchema[];

    constructor(User: User) {
        this.userDetails = User;
    }
}
