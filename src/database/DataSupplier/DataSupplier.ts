import { ApplicationUser, APIKey, JSONSchema } from '@database/models/index.js';
import { Entity, OneToMany, OneToOne } from 'typeorm';

@Entity()
export class DataSupplier {
    @OneToOne(() => ApplicationUser, { primary: true, cascade: true })
    userDetails: ApplicationUser;

    @OneToOne(() => APIKey, { primary: true, cascade: true })
    apiKey: APIKey;

    @OneToMany(() => JSONSchema, (jsonSchema) => jsonSchema.dataSupplier)
    jsonSchemas: JSONSchema[];
}
