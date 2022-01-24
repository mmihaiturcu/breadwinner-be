import { User, APIKey, JSONSchema } from '@/database/models/index.js';
import {
    BeforeInsert,
    Column,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryColumn,
} from 'typeorm';

@Entity()
export class DataSupplier {
    @PrimaryColumn()
    id: number;

    @OneToOne(() => User, { cascade: true })
    @JoinColumn({ name: 'id' })
    userDetails: User;

    @OneToOne(() => APIKey, { cascade: true })
    apiKey: APIKey;

    @OneToMany(() => JSONSchema, (jsonSchema) => jsonSchema.dataSupplier)
    jsonSchemas: JSONSchema[];

    constructor(User: User) {
        this.userDetails = User;
    }

    @BeforeInsert()
    mapsId() {
        this.id = this.userDetails.id;
    }
}
