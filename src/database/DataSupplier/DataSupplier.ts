import { ApplicationUser, APIKey, JSONSchema } from '@database/models/index.js';
import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DataSupplier {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => ApplicationUser, { primary: true, cascade: true })
    userDetails: ApplicationUser;

    @OneToOne(() => APIKey, { primary: true, cascade: true })
    apiKey: APIKey;

    @OneToMany(() => JSONSchema, (jsonSchema) => jsonSchema.dataSupplier)
    jsonSchemas: JSONSchema[];
}
